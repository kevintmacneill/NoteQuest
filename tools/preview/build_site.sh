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
  classic/index.html|classic/assets/*) return 0;;   # the original Note Quest, frozen (Kevin 2026-11-23); classic/FROZEN.md stays out
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
run_tests(){ # $1 = built dir (results go here), $2 = source checkout (tests run HERE, not in the public copy),
  # $3 = 1 if this checkout MUST have the test runner (main has one). Returns 0 only for a real pass (or no
  # runner where none is required); any failure, zero suites run, a timeout or a missing required runner returns 1.
  local d="$1" src="$2" need="${3:-0}"; local res="$d/test-results.txt" rc n bad st=1 log; log=$(mktemp)
  { echo "Note Quest engine test results"; echo "commit: $(git -C "$src" rev-parse HEAD 2>/dev/null)"; echo "built: $(date -u +%Y-%m-%dT%H:%MZ)"; echo
    if [ -f "$src/tests/run_engine_tests.sh" ]; then
      (cd "$src" && timeout 900 sh tests/run_engine_tests.sh < /dev/null > "$log" 2>&1); rc=$?
      grep -E "passed|FAIL|Error" "$log"
      n=$(grep -cE "^[0-9]+ passed, 0 failed" "$log"); bad=$(grep -cE "^FAIL|[0-9]+ passed, [1-9][0-9]* failed" "$log")
      if [ "$bad" -gt 0 ]; then echo "RESULT: SOME TESTS FAILED (exit $rc)"
      elif [ "$n" -eq 0 ]; then echo "RESULT: NO SUITE EXECUTED (exit $rc)"
      elif [ $rc -ne 0 ]; then echo "RESULT: SOME TESTS FAILED (exit $rc)"
      else echo "RESULT: ALL PASSED ($n suites)"; st=0; fi
    elif [ "$need" = 1 ]; then echo "RESULT: TEST RUNNER MISSING (main has tests/run_engine_tests.sh; this branch would delete it)"
    else echo "RESULT: NOT TESTED (no engine tests in this build)"; st=0; fi; } > "$res"
  rm -f "$log"; return $st
}
# Every failure is recorded here and decides the exit code (see the end of this script).
STATUS="${NQ_STATUS_FILE:-${RUNNER_TEMP:-/tmp}/nq-build-status.txt}"; : > "$STATUS"; ROOT_FAIL=0; PR_FAIL=0
fail_root(){ echo "FATAL: $1" | tee -a "$STATUS"; ROOT_FAIL=1; }
fail_pr(){ echo "PREVIEW FAILED: $1" | tee -a "$STATUS"; PR_FAIL=1; }
# live game from main
copy_build "$REPO_DIR" "$OUT"
NEED_RUNNER=0; [ -f "$REPO_DIR/tests/run_engine_tests.sh" ] && NEED_RUNNER=1
run_tests "$OUT" "$REPO_DIR" "$NEED_RUNNER" || fail_root "main: $(grep '^RESULT' "$OUT/test-results.txt")"
# previews of open pull requests
LIST="$OUT/preview/index.html"
{ echo '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Note Quest previews</title>'
  echo '<body style="font-family:system-ui;background:#1E2248;color:#fff;max-width:900px;margin:auto;padding:20px"><h1>Note Quest: pull request previews</h1>'
  echo '<p><a style="color:#F5C84C" href="../">Live game (main)</a> · <a style="color:#F5C84C" href="../tests.html">main tests</a> · <a style="color:#D8DDF8" href="../test-results.txt">main results.txt</a></p><ul>'; } > "$LIST"
# The list of open pull requests is required: without it every preview would silently vanish.
if [ -n "${NQ_PR_LIST:-}" ]; then cp "$NQ_PR_LIST" /tmp/prs.tsv 2>/dev/null || { : > /tmp/prs.tsv; fail_root "could not read the pull request list ($NQ_PR_LIST)"; }
else gh api "repos/${GITHUB_REPOSITORY:-kevintmacneill/NoteQuest}/pulls?state=open&per_page=100" --jq '.[]|[.number,.head.ref,.head.sha,(.title|gsub("\t";" "))]|@tsv' > /tmp/prs.tsv 2>/tmp/nq-gh.err \
  || { : > /tmp/prs.tsv; fail_root "could not list open pull requests: $(head -c 300 /tmp/nq-gh.err)"; }; fi
entry(){ # $1 num, $2 title, $3 ref, $4 sha, $5 links html, $6 summary
  local safe_title; safe_title=$(printf '%s' "$2" | sed 's/&/\&amp;/g;s/</\&lt;/g;s/>/\&gt;/g')
  echo "<li style=\"margin:10px 0\"><b>#$1</b> $safe_title<br>$5<br><small>$3 @ ${4:0:7}: $6</small></li>" >> "$LIST"; }
# stdin of the loop is fd 3 so nothing run inside it (git, node, the test runner) can swallow list lines
while IFS=$'\t' read -r num ref sha title <&3; do
  [ -z "$num" ] && continue
  dest="$OUT/preview/pr-$num"
  if [ -z "${NQ_PR_LIST:-}" ] && ! git fetch -q origin "$ref" < /dev/null; then
    fail_pr "#$num ($ref): could not fetch the branch"; entry "$num" "$title" "$ref" "$sha" '<b style="color:#FF8A80">PREVIEW FAILED: could not fetch the branch</b>' ""; continue; fi
  if ! git worktree add -q -f "_wt/pr-$num" "$sha" < /dev/null 2>/tmp/nq-wt.err; then
    fail_pr "#$num ($ref): could not check out ${sha:0:12}: $(head -c 200 /tmp/nq-wt.err)"; entry "$num" "$title" "$ref" "$sha" '<b style="color:#FF8A80">PREVIEW FAILED: could not check out this commit</b>' ""; continue; fi
  copy_build "_wt/pr-$num" "$dest"
  run_tests "$dest" "_wt/pr-$num" "$NEED_RUNNER" || fail_pr "#$num ($ref @ ${sha:0:7}): $(grep '^RESULT' "$dest/test-results.txt")"
  # previews get their OWN save slot so they can never read or change the real game's saved progress
  sed -i \
    -e "s/const KEY='noteQuest\.v1'/const KEY='noteQuest.preview.pr-$num'/" \
    -e "s/'noteQuest\.game32'/'noteQuest.preview.pr-$num.game32'/" \
    -e "s/'noteQuest\.game32\.lastPlayer'/'noteQuest.preview.pr-$num.game32.lastPlayer'/" \
    -e "s/'notequest-game32'/'notequest-preview-pr-$num-game32'/" "$dest/index.html"
  # the frozen original game (classic/) gets its own preview slots too: device save, last player and cloud
  classic_ok=1; if [ -f "$dest/classic/index.html" ]; then
    sed -i \
      -e "s/const KEY='noteQuest\.v1'/const KEY='noteQuest.preview.pr-$num.classic'/" \
      -e "s/LAST_PLAYER_KEY='noteQuest\.lastPlayer\.v1'/LAST_PLAYER_KEY='noteQuest.preview.pr-$num.classic.lastPlayer'/" \
      -e "s#'/notequest'#'/notequest-preview-pr-$num-classic'#" "$dest/classic/index.html"
    grep -q "const KEY='noteQuest.preview.pr-$num.classic'" "$dest/classic/index.html" &&
      grep -q "noteQuest.preview.pr-$num.classic.lastPlayer" "$dest/classic/index.html" &&
      grep -q "notequest-preview-pr-$num-classic" "$dest/classic/index.html" || classic_ok=0; fi
  if ! grep -q "noteQuest.preview.pr-$num" "$dest/index.html" || [ $classic_ok = 0 ]; then
    rm -rf "$dest"; git worktree remove -f "_wt/pr-$num"
    fail_pr "#$num ($ref): save-slot isolation failed, preview withheld"; entry "$num" "$title" "$ref" "$sha" '<b style="color:#FF8A80">PREVIEW FAILED: save-slot isolation failed</b>' ""; continue; fi
  summary=$(grep -E "passed|RESULT" "$dest/test-results.txt" | tr '\n' ' ' | head -c 400)
  entry "$num" "$title" "$ref" "$sha" "<a style=\"color:#F5C84C\" href=\"pr-$num/\">Play</a> · <a style=\"color:#7EE5C3\" href=\"pr-$num/tests.html?autorun\">Run tests in browser</a> · <a style=\"color:#D8DDF8\" href=\"pr-$num/test-results.txt\">results.txt</a>" "$summary"
  git worktree remove -f "_wt/pr-$num"
done 3< /tmp/prs.tsv
echo '</ul><p><small>Each preview has its own separate save slot, so playing a preview never touches the real game's saved progress, and tests.html never touches any save. To copy real progress into a preview, use the grown-up screen's save code.</small></p></body>' >> "$LIST"
rm -rf _wt
verify_site || fail_root "publish check failed (files outside the allowlist)"
# Exit codes: 0 = everything passed. 1 = main failed its tests, the publish check failed, or the pull request
# list could not be read: do NOT deploy. 3 = the site is safe to deploy, but at least one preview failed its
# tests or could not be built: deploy it so it can be inspected, then fail the gate (pages.yml does this).
if [ $ROOT_FAIL -ne 0 ]; then echo "SITE BUILD FAILED (do not deploy):"; sed 's/^/  /' "$STATUS"; exit 1; fi
if [ $PR_FAIL -ne 0 ]; then echo "site built in $OUT, but some previews FAILED:"; sed 's/^/  /' "$STATUS"; exit 3; fi
echo "site built in $OUT: main and all previews passed"
