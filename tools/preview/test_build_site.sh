#!/bin/bash
# Proves the Pages build publishes only allowlisted files: builds a throwaway repo full of private files
# (coordination notes, docs, scripts, a brand-new unknown file) with one fake pull-request preview, then
# checks none of them were published. Run from the repo root: bash tools/preview/test_build_site.sh
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"; FIX=$(mktemp -d); fail=0
cd "$FIX" && git init -q && git config user.email t@t && git config user.name t
mkdir -p assets coordination/messages tools/preview tests/browser .github/workflows notes
echo '<script id="nq-engine">\nconst KEY='"'"'noteQuest.v1'"'"'\n</script>' > index.html
echo 'body{}' > assets/theme.css; echo pdf > 'Song Sheets.pdf'; echo 'console.log("1 passed, 0 failed")' > tests/engine_node.js; echo synth > tests/synth.js
echo 'SECRET coordination' > coordination/messages/secret.md; echo 'SECRET status' > coordination/STATUS.md
echo 'SECRET readme' > README.md; echo 'SECRET notes' > notes/private.txt; echo 'SECRET new file' > brand-new-unknown.json
echo 'SECRET py' > tests/browser/x.py; echo 'SECRET wf' > .github/workflows/x.yml
cp "$HERE/build_site.sh" "$HERE/tests.html" tools/preview/
git add -A && git commit -qm fixture && git branch -q feature && sha=$(git rev-parse HEAD)
printf '99\tfeature\t%s\tFixture PR\n' "$sha" > /tmp/nq-fixture-prs.tsv
NQ_PR_LIST=/tmp/nq-fixture-prs.tsv bash tools/preview/build_site.sh _site > build.log 2>&1 || { echo "build failed:"; cat build.log; fail=1; }
check(){ if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi; }
check "root game published" "[ -f _site/index.html ] && [ -f _site/assets/theme.css ] && [ -f '_site/Song Sheets.pdf' ]"
check "preview published" "[ -f _site/preview/pr-99/index.html ] && [ -f _site/preview/pr-99/tests.html ] && [ -f _site/preview/index.html ]"
check "test sources published for tests.html" "[ -f _site/tests/engine_node.js ] && [ -f _site/preview/pr-99/tests/synth.js ]"
check "preview has its own save slot" "grep -q noteQuest.preview.pr-99 _site/preview/pr-99/index.html"
check "no coordination/ anywhere" "! find _site -path '*coordination*' | grep -q ."
check "no .git/.github/tools anywhere" "! find _site \\( -name .git -o -name .github -o -name tools \\) | grep -q ."
check "no README/notes/new unknown file/browser scripts" "! find _site \\( -name README.md -o -name private.txt -o -name brand-new-unknown.json -o -name x.py -o -name x.yml \\) | grep -q ."
check "no SECRET content anywhere" "! grep -rq SECRET _site"
check "publish check ran" "grep -q 'publish check passed' build.log"
# negative: a site with a leaked file must fail verify_site
mkdir -p _site/coordination && echo leak > _site/coordination/leak.md
sed -n '/^verify_site(){/,/^  echo "publish check passed/p' tools/preview/build_site.sh > /tmp/nq-verify.sh
out=$(OUT=_site bash -c 'source /tmp/nq-verify.sh && verify_site' 2>&1); rc=$?
check "verify_site rejects a leaked file" "[ $rc -ne 0 ] && echo \"\$out\" | grep -q 'PUBLISH CHECK FAILED' && echo \"\$out\" | grep -q leak.md"
rm -rf _site/coordination; out2=$(OUT=_site bash -c 'source /tmp/nq-verify.sh && verify_site' 2>&1); rc2=$?
check "verify_site passes the clean site" "[ $rc2 -eq 0 ]"
cd / && rm -rf "$FIX"
[ $fail -eq 0 ] && echo "publish allowlist: ALL PASSED" || { echo "publish allowlist: FAILED"; exit 1; }
