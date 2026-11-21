#!/bin/bash
# Builds the GitHub Pages site: the live game (main) at the root, plus a playable preview of every open
# pull request at /preview/pr-<n>/ with an in-browser test page (tests.html) and plain-text test results.
# Usage (from the repo root, on main, with gh authenticated): tools/preview/build_site.sh [_site]
set -u
OUT="${1:-_site}"; REPO_DIR="$(pwd)"
rm -rf "$OUT" _wt && mkdir -p "$OUT/preview" _wt
# Only these files are ever published (allowlist, not blacklist): the game, its art, the printable PDFs,
# and the engine test sources that tests.html runs (intentionally public). Everything else stays out.
# Test data files tests.html loads, taken from its DATA_FILES list, so fixtures are published explicitly.
DATA_FILES=$(grep -o "const DATA_FILES=\[[^]]*\]" "$REPO_DIR/tools/preview/tests.html" | grep -o "'[^']*'" | tr -d "'")
publishable(){ case "$1" in
  index.html|.nojekyll|assets/*|*.pdf) return 0;;
  tests/*/*) return 1;;
  tests/*_node.js|tests/synth.js) return 0;;
  tests/*) for d in $DATA_FILES; do [ "$1" = "tests/$d" ] && return 0; done; return 1;;
  *) return 1;; esac; }
copy_build(){ # $1 = source checkout, $2 = destination dir
  mkdir -p "$2"
  (cd "$1" && git ls-files) | while IFS= read -r f; do publishable "$f" || continue; mkdir -p "$2/$(dirname "$f")"; cp "$1/$f" "$2/$f"; done
  cp "$REPO_DIR/tools/preview/tests.html" "$2/tests.html"
  touch "$2/.nojekyll"
}
# Fails the build if anything outside the allowlist ended up in the site (root or any preview).
verify_site(){ local bad
  bad=$(cd "$OUT" && find . -type f | sed 's#^\./##' | while IFS= read -r f; do
    g="$f"; case "$f" in preview/index.html) continue;; preview/pr-*/*) g="${f#preview/pr-*/}";; preview/*) echo "$f"; continue;; esac
    case "$g" in tests.html|test-results.txt) ;; *) publishable "$g" || echo "$f";; esac
  done)
  for d in coordination .git .github tools; do find "$OUT" -type d -name "$d" | grep -q . && bad="$bad
$(find "$OUT" -type d -name "$d")"; done
  if [ -n "$(echo "$bad" | tr -d '[:space:]')" ]; then echo "PUBLISH CHECK FAILED: not allowed in the site:"; echo "$bad" | sed '/^$/d;s/^/  /'; return 1; fi
  echo "publish check passed: only allowlisted files in $OUT"; }
run_tests(){ # $1 = built dir (results go here), $2 = source checkout (tests run HERE, not in the public copy)
  local d="$1" src="$2"; local res="$d/test-results.txt" rc n bad
  { echo "Note Quest engine test results"; echo "commit: $(git -C "$src" rev-parse HEAD 2>/dev/null)"; echo "built: $(date -u +%Y-%m-%dT%H:%MZ)"; echo
    if [ -f "$src/tests/run_engine_tests.sh" ]; then
      (cd "$src" && timeout 900 sh tests/run_engine_tests.sh > /tmp/nq-run.log 2>&1); rc=$?
      grep -E "passed|FAIL|Error" /tmp/nq-run.log
      n=$(grep -cE "^[0-9]+ passed, 0 failed" /tmp/nq-run.log); bad=$(grep -cE "^FAIL|[0-9]+ passed, [1-9][0-9]* failed" /tmp/nq-run.log)
      if [ "$n" -eq 0 ]; then echo "RESULT: NO SUITE EXECUTED (exit $rc)"
      elif [ $rc -eq 0 ] && [ "$bad" -eq 0 ]; then echo "RESULT: ALL PASSED ($n suites)"
      else echo "RESULT: SOME TESTS FAILED (exit $rc)"; fi
    else echo "(no engine tests in this build)"; fi; } > "$res"
}
# live game from main
copy_build "$REPO_DIR" "$OUT"
run_tests "$OUT" "$REPO_DIR"
# previews of open pull requests
LIST="$OUT/preview/index.html"
{ echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Note Quest previews</title>'
  echo '<body style="font-family:system-ui;background:#1E2248;color:#fff;max-width:900px;margin:auto;padding:20px"><h1>Note Quest: pull request previews</h1>'
  echo '<p><a style="color:#F5C84C" href="../">Live game (main)</a> · <a style="color:#F5C84C" href="../tests.html">main tests</a> · <a style="color:#D8DDF8" href="../test-results.txt">main results.txt</a></p><ul>'; } > "$LIST"
if [ -n "${NQ_PR_LIST:-}" ]; then cp "$NQ_PR_LIST" /tmp/prs.tsv; else gh api "repos/${GITHUB_REPOSITORY:-kevintmacneill/NoteQuest}/pulls?state=open&per_page=50" --jq '.[]|[.number,.head.ref,.head.sha,(.title|gsub("\t";" "))]|@tsv' > /tmp/prs.tsv 2>/dev/null || : > /tmp/prs.tsv; fi
while IFS=$'\t' read -r num ref sha title; do
  [ -z "$num" ] && continue
  [ -n "${NQ_PR_LIST:-}" ] || git fetch -q origin "$ref" || continue
  git worktree add -q -f "_wt/pr-$num" "$sha" || continue
  dest="$OUT/preview/pr-$num"; copy_build "_wt/pr-$num" "$dest"; run_tests "$dest" "_wt/pr-$num"
  # previews get their OWN save slot so they can never read or change the real game's saved progress
  sed -i "s/const KEY='noteQuest.v1'/const KEY='noteQuest.preview.pr-$num'/" "$dest/index.html"
  grep -q "noteQuest.preview.pr-$num" "$dest/index.html" || { echo "save-slot isolation failed for pr-$num"; rm -rf "$dest"; continue; }
  summary=$(grep -E "passed|RESULT|no engine tests" "$dest/test-results.txt" | tr '\n' ' ' | head -c 400)
  safe_title=$(printf '%s' "$title" | sed 's/&/\&amp;/g;s/</\&lt;/g;s/>/\&gt;/g')
  echo "<li style=\"margin:10px 0\"><b>#$num</b> $safe_title<br><a style=\"color:#F5C84C\" href=\"pr-$num/\">Play</a> · <a style=\"color:#7EE5C3\" href=\"pr-$num/tests.html?autorun\">Run tests in browser</a> · <a style=\"color:#D8DDF8\" href=\"pr-$num/test-results.txt\">results.txt</a><br><small>$ref @ ${sha:0:7}: $summary</small></li>" >> "$LIST"
  git worktree remove -f "_wt/pr-$num"
done < /tmp/prs.tsv
echo '</ul><p><small>Each preview has its own separate save slot, so playing a preview never touches the real game's saved progress, and tests.html never touches any save. To copy real progress into a preview, use the grown-up screen's save code.</small></p></body>' >> "$LIST"
rm -rf _wt
verify_site || exit 1
echo "site built in $OUT"
