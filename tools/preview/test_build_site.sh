#!/bin/bash
# Proves the Pages build (1) publishes only allowlisted files: builds a throwaway repo full of private files
# (coordination notes, docs, scripts, a brand-new unknown file) with one fake pull-request preview, then
# checks none of them were published; and (2) fails when it should (issue #30): a failing suite, a runner
# that runs zero suites, a branch missing the runner, a commit that cannot be checked out, an unreadable
# pull request list, and failing tests on main must each make the build exit nonzero.
# Run from the repo root: bash tools/preview/test_build_site.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; FIX=$(mktemp -d); fail=0; export NQ_STATUS_FILE="$FIX/build-status.txt"
cd "$FIX" && git init -q && git config user.email t@t && git config user.name t
mkdir -p assets classic coordination/messages tools/preview tests/browser .github/workflows notes
echo '<script id="nq-engine">\nconst KEY='"'"'noteQuest.v1'"'"'\n</script>' > index.html
echo 'body{}' > assets/theme.css; echo pdf > 'Song Sheets.pdf'; echo 'console.log("1 passed, 0 failed")' > tests/engine_node.js; echo synth > tests/synth.js
echo '<h1>Music Reference</h1>' > reference.html
echo '<h1>Excluded fixture</h1>' > classic/index.html
printf '#!/bin/sh\nnode tests/engine_node.js\n' > tests/run_engine_tests.sh
DATA=$(grep -o "const DATA_FILES=\[[^]]*\]" "$HERE/tests.html" | grep -o "'[^']*'" | tr -d "'" | head -1); [ -n "$DATA" ] && echo '{"fixture":true}' > "tests/$DATA"
echo 'SECRET contract' > tests/internal_contract.json
echo 'SECRET coordination' > coordination/messages/secret.md; echo 'SECRET status' > coordination/STATUS.md
echo 'SECRET readme' > README.md; echo 'SECRET notes' > notes/private.txt; echo 'SECRET new file' > brand-new-unknown.json
echo 'SECRET py' > tests/browser/x.py; echo 'SECRET wf' > .github/workflows/x.yml
cp "$HERE/build_site.sh" "$HERE/tests.html" tools/preview/
git add -A && git commit -qm fixture && git branch -q feature && sha=$(git rev-parse HEAD); main=$(git rev-parse --abbrev-ref HEAD)
# bad branches for the negative tests (issue #30). The failing runner also reads stdin, to prove it cannot
# swallow the rest of the pull request list.
git checkout -q -b failing && printf 'console.log("3 passed, 1 failed");process.exit(1)\n' > tests/engine_node.js
printf '#!/bin/sh\ncat > /dev/null\nnode tests/engine_node.js\n' > tests/run_engine_tests.sh && git commit -qam failing && sha_fail=$(git rev-parse HEAD)
git checkout -q "$main" && git checkout -q -b zerosuite && echo 'console.log("hello, nothing ran")' > tests/engine_node.js && git commit -qam zero && sha_zero=$(git rev-parse HEAD)
git checkout -q "$main" && git checkout -q -b norunner && git rm -q tests/run_engine_tests.sh && git commit -qm norunner && sha_norun=$(git rev-parse HEAD)
git checkout -q "$main" && git checkout -q -b game32
cat > index.html <<'HTML'
const format={key:'noteQuest.game32',cloud:'notequest-game32'};
const LAST_PLAYER_KEY='noteQuest.game32.lastPlayer';
HTML
git commit -qam game32 && sha_game32=$(git rev-parse HEAD)
git checkout -q -b partial32
sed -i "s/'notequest-game32'/\"notequest-game32\"/" index.html
git commit -qam partial32 && sha_partial32=$(git rev-parse HEAD)
git checkout -q "$main"
printf '99\tfeature\t%s\tFixture PR\n100\tgame32\t%s\tv3.2 PR\n' "$sha" "$sha_game32" > /tmp/nq-fixture-prs.tsv
NQ_PR_LIST=/tmp/nq-fixture-prs.tsv bash tools/preview/build_site.sh _site > build.log 2>&1; rc_good=$?
[ $rc_good -eq 0 ] || { echo "build failed (exit $rc_good):"; cat build.log; fail=1; }
check(){ if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; return 1; fi; }
check "root game published" "[ -f _site/index.html ] && [ -f _site/assets/theme.css ] && [ -f '_site/Song Sheets.pdf' ]"
check "Music Reference is included in the live game and previews" "[ -f _site/reference.html ] && [ -f _site/preview/pr-99/reference.html ]"
check "preview published" "[ -f _site/preview/pr-99/index.html ] && [ -f _site/preview/pr-99/tests.html ] && [ -f _site/preview/index.html ]"
check "test sources published for tests.html" "[ -f _site/tests/engine_node.js ] && [ -f _site/preview/pr-99/tests/synth.js ]"
check "classic is excluded from the live site and previews" "[ ! -e _site/classic ] && [ ! -e _site/preview/pr-99/classic ]"
check "preview has its own save slot" "grep -q noteQuest.preview.pr-99 _site/preview/pr-99/index.html"
check "v3.2 preview has isolated device, last learner and cloud slots" \
  "grep -q 'noteQuest.preview.pr-100.game32' _site/preview/pr-100/index.html &&
   grep -q 'noteQuest.preview.pr-100.game32.lastPlayer' _site/preview/pr-100/index.html &&
   grep -q 'notequest-preview-pr-100-game32' _site/preview/pr-100/index.html"
check "no coordination/ anywhere" "! find _site -path '*coordination*' | grep -q ."
check "no .git/.github/tools anywhere" "! find _site \\( -name .git -o -name .github -o -name tools \\) | grep -q ."
check "no README/notes/new unknown file/browser scripts" "! find _site \\( -name README.md -o -name private.txt -o -name brand-new-unknown.json -o -name x.py -o -name x.yml \\) | grep -q ."
check "no SECRET content anywhere" "! grep -rq SECRET _site"
check "publish check ran" "grep -q 'publish check passed' build.log"
check "tests ran from the source checkout (root)" "grep -q '1 passed, 0 failed' _site/test-results.txt && grep -q 'RESULT: ALL PASSED (1 suites)' _site/test-results.txt"
check "tests ran from the source checkout (preview)" "grep -q 'RESULT: ALL PASSED (1 suites)' _site/preview/pr-99/test-results.txt"
check "test runner script itself not published" "[ ! -f _site/tests/run_engine_tests.sh ]"
check "listed test data file published" "[ -z \"$DATA\" ] || [ -f _site/preview/pr-99/tests/$DATA ]"
check "unlisted test JSON not published" "! find _site -name internal_contract.json | grep -q ."

check "clean build exits 0 with an empty failure list" "[ $rc_good -eq 0 ] && [ ! -s build-status.txt ] && grep -q 'main and all previews passed' build.log"

# negative (#30): each broken preview must exit 3 (site still deployable, gate fails) and say why
neg(){ # $1 label, $2 list file contents, $3 expected exit, $4 text expected in build-status.txt
  printf "$2" > /tmp/nq-neg.tsv; NQ_PR_LIST=/tmp/nq-neg.tsv bash tools/preview/build_site.sh _neg > neg.log 2>&1; local r=$?
  check "$1 -> exit $3" "[ $r -eq $3 ] && grep -q \"$4\" build-status.txt" || { cat neg.log; }; }
neg "failing suite" "41\tfailing\t$sha_fail\tBad\n" 3 "#41 (failing @ ${sha_fail:0:7}): RESULT: SOME TESTS FAILED"
neg "zero suites executed" "42\tzerosuite\t$sha_zero\tZero\n" 3 "#42 (zerosuite @ ${sha_zero:0:7}): RESULT: NO SUITE EXECUTED"
neg "runner deleted on a branch" "43\tnorunner\t$sha_norun\tNo runner\n" 3 "#43 (norunner @ ${sha_norun:0:7}): RESULT: TEST RUNNER MISSING"
neg "commit cannot be checked out" "44\tgone\t0123456789abcdef0123456789abcdef01234567\tGone\n" 3 "#44 (gone): could not check out"
check "failed checkout is listed, not silently skipped" "grep -q '#44' _neg/preview/index.html && grep -q 'PREVIEW FAILED' _neg/preview/index.html"
neg "v3.2 cloud slot was not isolated" "45\tpartial32\t$sha_partial32\tUnsafe\n" 3 "save-slot isolation failed"
check "incomplete v3.2 isolation is withheld" "[ ! -e _neg/preview/pr-45/index.html ]"
# a failing preview must not hide the others (and its runner reading stdin must not eat the next line)
neg "failing preview next to a good one" "41\tfailing\t$sha_fail\tBad\n99\tfeature\t$sha\tGood\n" 3 "#41"
check "good preview still built and passing" "grep -q 'RESULT: ALL PASSED (1 suites)' _neg/preview/pr-99/test-results.txt && grep -q 'pr-99/' _neg/preview/index.html"
check "failing preview still published for inspection" "grep -q 'RESULT: SOME TESTS FAILED' _neg/preview/pr-41/test-results.txt"
check "good preview not reported as failed" "! grep -q '#99' build-status.txt"
# fatal cases must exit 1 (do not deploy)
NQ_PR_LIST=/nonexistent/prs.tsv bash tools/preview/build_site.sh _neg > neg.log 2>&1; r=$?
check "unreadable pull request list -> exit 1" "[ $r -eq 1 ] && grep -q 'FATAL: could not read the pull request list' build-status.txt"
git checkout -q failing; : > /tmp/nq-empty.tsv
NQ_PR_LIST=/tmp/nq-empty.tsv bash tools/preview/build_site.sh _neg > neg.log 2>&1; r=$?
check "main failing its tests -> exit 1" "[ $r -eq 1 ] && grep -q 'FATAL: main: RESULT: SOME TESTS FAILED' build-status.txt && grep -q 'SITE BUILD FAILED' neg.log"
git checkout -q zerosuite; NQ_PR_LIST=/tmp/nq-empty.tsv bash tools/preview/build_site.sh _neg > neg.log 2>&1; r=$?
check "main running zero suites -> exit 1" "[ $r -eq 1 ] && grep -q 'FATAL: main: RESULT: NO SUITE EXECUTED' build-status.txt"
git checkout -q "$main"; rm -rf _neg

# negative: a site with a leaked file must fail verify_site
mkdir -p _site/coordination && echo leak > _site/coordination/leak.md
sed -n '/^DATA_FILES=/,/^  echo "publish check passed/p' tools/preview/build_site.sh > /tmp/nq-verify.sh
out=$(REPO_DIR=$PWD OUT=_site bash -c 'source /tmp/nq-verify.sh && verify_site' 2>&1); rc=$?
check "verify_site rejects a leaked file" "[ $rc -ne 0 ] && echo \"\$out\" | grep -q 'PUBLISH CHECK FAILED' && echo \"\$out\" | grep -q leak.md"
rm -rf _site/coordination; out2=$(REPO_DIR=$PWD OUT=_site bash -c 'source /tmp/nq-verify.sh && verify_site' 2>&1); rc2=$?
check "verify_site passes the clean site" "[ $rc2 -eq 0 ]"
cd / && rm -rf "$FIX"
[ $fail -eq 0 ] && echo "site build checks (allowlist + failure gate): ALL PASSED" || { echo "site build checks: FAILED"; exit 1; }
