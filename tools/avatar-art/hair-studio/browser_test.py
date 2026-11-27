"""Browser-to-checker test. Creates synthetic fixtures only."""
import io
import json
from pathlib import Path
import threading
import zipfile

from PIL import Image, ImageDraw
from playwright.sync_api import expect, sync_playwright

from server import Handler, ThreadingHTTPServer, HERE, digest, verified_checker


def fixture(kind):
    im = Image.new("RGBA", (1024, 1024))
    d = ImageDraw.Draw(im)
    if kind == "skin":
        d.ellipse((397, 115, 626, 390), fill=(197, 132, 95, 255))
        d.ellipse((430, 365, 592, 980), fill=(197, 132, 95, 255))
    elif kind == "wide-hair":
        d.ellipse((365, 98, 654, 350), fill=(75, 47, 22, 255))
    elif kind == "hair":
        d.ellipse((493, 171, 527, 205), fill=(75, 47, 22, 255))
    elif kind == "scalp":
        d.ellipse((508, 183, 519, 194), fill=(255, 0, 0, 255))
    output = io.BytesIO()
    im.save(output, "PNG")
    return {"name": kind + ".png", "mimeType": "image/png", "buffer": output.getvalue()}


def main():
    host = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    host.checker = HERE / "hair_check.py"
    assert verified_checker(host.checker)
    thread = threading.Thread(target=host.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{host.server_port}"
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            page = browser.new_page(accept_downloads=True, viewport={"width": 1450, "height": 1000})
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(url)
            expect(page.locator("#style")).to_have_value("girl-ponytail")
            fail = page.request.post(url + "/check", data={
                "selection": {"pose": "front", "body": "girl", "style": "girl-ponytail", "color": "hc-brown"},
                "files": {"skin": "", "scalp": "", "front": "", "rig": ""},
            })
            assert fail.status == 422 and "both hair planes" in fail.json()["error"]
            for field, name in (("skin", "skin"), ("scalp", "scalp"), ("front", "wide-hair")):
                page.locator(f"#{field}File").set_input_files(fixture(name))
                expect(page.locator("#status")).to_have_text(name + ".png loaded.")
            rig = {"canvas": 1024, "sourceSize": 1024, "zones": {"head": [320, 70, 700, 445]}}
            page.locator("#rigFile").set_input_files({"name": "rig.json", "mimeType": "application/json",
                                                     "buffer": json.dumps(rig).encode()})
            page.get_by_label("X offset").fill("6")
            page.get_by_label("X offset").press("Tab")
            page.get_by_role("button", name="Undo", exact=True).click()
            assert page.get_by_label("X offset").input_value() == "0"
            page.get_by_role("button", name="Redo", exact=True).click()
            assert page.get_by_label("X offset").input_value() == "6"
            page.get_by_role("button", name="Run hair checker").click()
            expect(page.locator("#report")).to_contain_text("FAIL straight cut edge", timeout=15000)
            page.locator("#frontFile").set_input_files(fixture("hair"))
            expect(page.locator("#status")).to_have_text("hair.png loaded.")
            expect(page.locator("#report")).to_have_text("No result for this revision.")
            page.get_by_role("button", name="Run hair checker").click()
            expect(page.locator("#report")).to_contain_text("expected selection checked", timeout=15000)
            assert page.get_by_role("button", name="Lock checked revision").is_disabled()
            page.get_by_role("button", name="Save draft").click()
            expect(page.locator("#status")).to_contain_text("Draft revision saved.")
            before_export = page.locator("#history").input_value()
            with page.expect_download(timeout=45000) as dl:
                page.get_by_role("button", name="Export review ZIP").click()
            with zipfile.ZipFile(Path(dl.value.path())) as z:
                data = json.loads(z.read("fit.json"))
                assert data["fit"]["affine"]["x"] == 6
                assert data["key"] == "girl/girl-ponytail/front/hc-brown"
                assert "review/before-head.png" in z.namelist()
                assert len(json.loads(z.read("report/report.json"))["results"]) == 1
                for plane in ("front", "back"):
                    name = f"SRC/front/girl/hair/girl-ponytail/hc-brown.{plane}.png"
                    png = z.read(name)
                    assert data["outputSha256"][plane] == digest(png)
                    with Image.open(io.BytesIO(png)) as decoded:
                        assert decoded.size == (1024, 1024)
                        assert decoded.mode == "RGBA"
                assert before_export
            page.get_by_role("button", name="Open revision").click()
            assert page.get_by_label("X offset").input_value() == "6"
            page.locator("#style").select_option("girl-braids")
            assert page.get_by_role("button", name="Reset fit").is_disabled()
            assert "View-only" in page.locator("#gate").inner_text()
            assert not errors, errors
            browser.close()
    finally:
        host.shutdown()
        host.server_close()
        thread.join()
    print("Studio browser, history, approval gate, real checker and PNG package tests passed.")


if __name__ == "__main__":
    main()
