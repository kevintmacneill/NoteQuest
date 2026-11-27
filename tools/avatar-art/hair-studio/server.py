"""Loopback-only host for the NoteQuest hair registration editor and checker."""
import argparse
import base64
import binascii
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = Path(__file__).resolve().parent
CHECKER_SHA = "d2187804ceeec4fd8d55aeee9197e3328c0f9198462df1169448c77d73b5b3d3"
MAX_REQUEST = 48 * 1024 * 1024
POSES = {"front", "wave", "walk"}
COLORS = {"hc-" + n for n in ("brown", "black", "darkbrown", "lightbrown", "auburn", "ginger", "blonde", "platinum")}
STYLES = {
    "girl": {"girl-ponytail", "girl-braids", "girl-bob", "girl-curly", "girl-long", "girl-buns"},
    "boy": {"boy-short", "boy-curly", "boy-spiky", "boy-side", "boy-buzz", "boy-wavy"},
}
REVIEW = {"before-body", "after-body", "before-head", "after-head", "left-ear", "right-ear",
          "forehead", "left-temple", "right-temple", "jaw", "landmark-overlay"}
STATIC = {
    "/": ("index.html", "text/html; charset=utf-8"),
    "/studio.css": ("studio.css", "text/css; charset=utf-8"),
    "/studio.mjs": ("studio.mjs", "text/javascript; charset=utf-8"),
    "/core.mjs": ("core.mjs", "text/javascript; charset=utf-8"),
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def verified_checker(path):
    data = Path(path).read_bytes()
    if digest(data) == CHECKER_SHA:
        return data
    # Git may check out text with CRLF on Windows. Recover canonical Git bytes.
    canonical = data.replace(b"\r\n", b"\n")
    if digest(canonical) == CHECKER_SHA:
        return canonical
    raise ValueError("Checker SHA-256 mismatch. Supply the unmodified #173 checker from 0fb3a87.")


def decode(value):
    if not isinstance(value, str):
        raise ValueError("Expected base64 text.")
    try:
        return base64.b64decode(value, validate=True)
    except binascii.Error as error:
        raise ValueError("Invalid base64 data.") from error


def selection(data):
    if not isinstance(data, dict) or set(data) != {"pose", "body", "style", "color"}:
        raise ValueError("One exact body, pose, hairstyle and color are required.")
    pose, body, style, color = (data[k] for k in ("pose", "body", "style", "color"))
    if not all(isinstance(v, str) for v in (pose, body, style, color)):
        raise ValueError("Invalid NoteQuest source identifiers.")
    if pose not in POSES or style not in STYLES.get(body, ()) or color not in COLORS:
        raise ValueError("Invalid NoteQuest source identifiers.")
    return pose, body, style, color


def rgba(data, plane):
    with Image.open(io.BytesIO(data)) as img:
        if img.format != "PNG" or img.size != (1024, 1024) or "A" not in img.mode:
            raise ValueError(f"{plane} must be a 1024 × 1024 PNG with alpha.")
        if plane in ("front", "back") and img.mode != "RGBA":
            raise ValueError(f"{plane} must be RGBA.")
        low, high = img.getchannel("A").getextrema()
        if low != 0 or (plane != "back" and not high):
            raise ValueError(f"{plane} has invalid transparency or is empty.")


def stage(root, body):
    pose, character, style, color = selection(body.get("selection"))
    encoded = body.get("files")
    if not isinstance(encoded, dict) or set(encoded) != {"skin", "scalp", "front", "back", "rig"}:
        raise ValueError("Expected body, scalp, rig and both hair planes. Use a transparent PNG for an empty back plane.")
    data = {k: decode(v) for k,v in encoded.items()}
    for k in ("skin", "scalp", "front", "back"):
        rgba(data[k], k)
    rig = json.loads(data["rig"].decode("utf-8-sig"))
    if not isinstance(rig, dict) or not isinstance(rig.get("zones"), dict):
        raise ValueError("Invalid candidate rig.")
    canvas = rig.get("canvas")
    head = rig["zones"].get("head")
    if (type(canvas) is not int or canvas <= 0 or rig.get("sourceSize", canvas) != 1024 or
            not isinstance(head, list) or len(head) != 4 or
            any(type(x) is not int or not 0 <= x <= canvas for x in head) or
            head[0] >= head[2] or head[1] >= head[3]):
        raise ValueError("Invalid 1024-source candidate rig or head zone.")
    prefix = Path("SRC", pose, character)
    paths = {
        "skin": prefix / "skin/skin-2.png",
        "scalp": prefix / "scalp.png",
        "front": prefix / "hair" / style / f"{color}.front.png",
        "back": prefix / "hair" / style / f"{color}.back.png",
        "rig": Path("rig.candidate.json"),
    }
    for name, relative in paths.items():
        path = root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data[name])
    return f"{character}/{style}/{pose}/{color}", color, paths, data


def check(root, checker, key, color):
    script = root / "hair_check.py"
    script.write_bytes(checker)
    out = root / "report"
    # The checker reads rig JSON with the platform default encoding. The
    # verified inputs and rig remain byte-for-byte in the review package.
    rig = root / "rig.candidate.json"
    if rig.read_bytes().startswith(b"\xef\xbb\xbf"):
        checker_rig = root / "checker-rig.json"
        checker_rig.write_bytes(rig.read_bytes()[3:])
    else:
        checker_rig = rig
    result = subprocess.run([sys.executable, "-X", "utf8", str(script), str(root), "--out", str(out),
                             "--rig", str(checker_rig), "--colors", color],
                            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120)
    report_path = out / "report.json"
    report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else {}
    rows = report.get("results", {})
    issues = list(report.get("structural", []))
    if set(rows) != {key} or report.get("colors") != [color]:
        issues.append(f"Expected exactly {key}; checked {', '.join(rows) or 'nothing'}.")
    row = rows.get(key)
    if not row:
        issues.append("The checker did not return a result for the expected selection.")
    passed = result.returncode == 0 and not issues and row and not row.get("fail")
    return {"pass": bool(passed), "issues": issues, "result": row, "checkerSha256": digest(checker),
            "exitCode": result.returncode, "stdout": result.stdout + result.stderr}


def inspection_hints(data):
    def open_rgba(name):
        with Image.open(io.BytesIO(data[name])) as image:
            return np.asarray(image.convert("RGBA"))

    front, back = open_rgba("front"), open_rgba("back")
    foreground = np.maximum(front[..., 3], back[..., 3]) >= 128

    def regions(mask, min_size):
        labels, _ = ndimage.label(mask, structure=np.ones((3, 3)))
        out = []
        for i, box in enumerate(ndimage.find_objects(labels), 1):
            if box is None:
                continue
            count = int(np.count_nonzero(labels[box] == i))
            if count >= min_size:
                y, x = box
                out.append({"pixels": count, "box": [x.start, y.start, x.stop, y.stop]})
        return sorted(out, key=lambda item: item["pixels"], reverse=True)

    pale = np.zeros(foreground.shape, bool)
    for plane in (front, back):
        alpha = plane[..., 3]
        rgb = plane[..., :3]
        bright, dark = rgb.max(axis=2), rgb.min(axis=2)
        pale |= (alpha >= 12) & (alpha < 235) & (dark > 158) & ((bright - dark) < 36)
    return {"fragments": regions(foreground, 1)[1:21], "paleEdge": regions(pale, 3)[:20]}


def review_package(root, payload, key, paths, data, result):
    revision = payload.get("revision")
    if not isinstance(revision, dict) or revision.get("key") != key or revision.get("version") != 1:
        raise ValueError("The revision does not match the selected candidate.")
    outputs = {k: digest(data[k]) for k in ("front", "back")}
    if revision.get("outputSha256") != outputs or revision.get("rigSha256") != digest(data["rig"]):
        raise ValueError("Export hashes differ from the captured revision.")
    source_hashes = revision.get("sourceSha256", {})
    if any(source_hashes.get(k) != digest(data[k]) for k in ("skin", "scalp")):
        raise ValueError("Export body or scalp bytes differ from the captured revision.")
    if revision.get("owner") and not result["pass"]:
        raise ValueError("A locked revision must pass again for these exact outputs.")
    board = payload.get("review", {})
    required = {"before-body", "after-body", "before-head", "after-head", "landmark-overlay"}
    if not isinstance(board, dict) or not required <= set(board) <= REVIEW:
        raise ValueError("Missing or invalid composite evidence.")
    package = io.BytesIO()
    with zipfile.ZipFile(package, mode="w", compression=zipfile.ZIP_DEFLATED) as z:
        for path in paths.values():
            z.write(root / path, path.as_posix())
        z.writestr("fit.json", json.dumps(revision, indent=2))
        z.writestr("studio-check.json", json.dumps(result, indent=2))
        z.writestr("SHA256SUMS.txt", "".join(f"{digest(data[k])}  {p.as_posix()}\n" for k,p in sorted(paths.items())))
        z.writestr("correction-notes.txt", revision.get("notes", ""))
        if revision.get("landmarks"):
            z.writestr("base-landmarks.json", json.dumps(revision["landmarks"], indent=2))
        for p in sorted((root / "report").rglob("*")):
            if p.is_file():
                z.write(p, p.relative_to(root).as_posix())
        for name, value in board.items():
            png = decode(value)
            with Image.open(io.BytesIO(png)) as image:
                if image.format != "PNG" or max(image.size) > 3072:
                    raise ValueError("Invalid composite preview.")
                image.verify()
            z.writestr("review/" + name + ".png", png)
    return package.getvalue()


class Handler(BaseHTTPRequestHandler):
    def permitted(self):
        authority = f"127.0.0.1:{self.server.server_port}"
        if self.headers.get("Host") != authority:
            return False
        origin = self.headers.get("Origin")
        return origin is None or origin == f"http://{authority}"

    def send_bytes(self, status, data, mime):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' blob: data:; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(data)

    def json(self, status, obj):
        self.send_bytes(status, json.dumps(obj).encode(), "application/json; charset=utf-8")

    def do_GET(self):
        if not self.permitted():
            self.json(403, {"error": "Use the printed loopback URL."})
        elif self.path in STATIC:
            name, mime = STATIC[self.path]
            self.send_bytes(200, (HERE / name).read_bytes(), mime)
        else:
            self.json(404, {"error": "Unknown studio route."})

    def do_POST(self):
        if not self.permitted() or self.headers.get_content_type() != "application/json":
            self.json(403, {"error": "Only the local studio can submit a candidate."})
            return
        if self.path not in ("/check", "/export"):
            self.json(404, {"error": "Unknown studio route."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_REQUEST:
                raise ValueError("Missing request or candidate exceeds the request limit.")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError("Expected a candidate object.")
            with tempfile.TemporaryDirectory(prefix="notequest-hair-") as name:
                root = Path(name)
                key, color, paths, data = stage(root, payload)
                checker = verified_checker(self.server.checker)
                result = check(root, checker, key, color)
                result["inspection"] = inspection_hints(data)
                if self.path == "/export":
                    self.send_bytes(200, review_package(root, payload, key, paths, data, result), "application/zip")
                else:
                    self.json(200, result)
        except (ValueError, OSError, subprocess.SubprocessError) as error:
            self.json(422, {"error": str(error)})


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument("--checker", default=HERE / "hair_check.py", type=Path,
                     help="Exact scoped hair_check.py from #173 head 0fb3a87.")
    cli.add_argument("--port", default=8765, type=int)
    args = cli.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), Handler) as server:
        server.checker = args.checker.resolve()
        print(f"Open http://127.0.0.1:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
