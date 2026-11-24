#!/bin/sh
# Freezes the original Note Quest (Kevin 2026-11-23): copies the game at a git ref into classic/, with every asset it
# loads, so it stays playable at /classic/ with its own saves ('noteQuest.v1', 'NQ1:' codes, cloud 'notequest').
# The frozen ref is 833de5f: main right before PR #118 (the v3.2 new game) merged. Usage: sh tools/classic/freeze.sh <ref>
set -eu
REF="${1:?usage: freeze.sh <git ref of the original game>}"
cd "$(dirname "$0")/../.."
rm -rf classic && mkdir -p classic/assets
git show "$REF:index.html" > classic/index.html
grep -q "const KEY='noteQuest.v1'" classic/index.html || { echo "freeze: $REF is not the original game (save key is not noteQuest.v1)"; exit 1; }
todo=$(grep -o "assets/[A-Za-z0-9_./-]*" classic/index.html | sort -u)
done_list=""
while [ -n "$todo" ]; do
  next=""
  for a in $todo; do
    case " $done_list " in *" $a "*) continue;; esac
    done_list="$done_list $a"
    git show "$REF:$a" > "classic/$a"
    next="$next $(grep -o "assets/[A-Za-z0-9_./-]*" "classic/$a" | sort -u || true)"
  done
  todo=$(echo $next | tr ' ' '\n' | sort -u | tr '\n' ' ')
  for a in $done_list; do todo=$(echo " $todo " | sed "s# $a # #g"); done
  todo=$(echo $todo)
done
sha=$(git rev-parse "$REF")
{ echo "# The original Note Quest (frozen)"; echo
  echo "Frozen from \`$REF\` at \`$sha\` by \`tools/classic/freeze.sh\`. Kevin (2026-11-23): Note Quest v3.2 is a new game;"
  echo "the original stays playable here, unchanged, with its own saves. Do not edit these files; re-freeze instead."; echo
  echo "| file | sha256 |"; echo "|---|---|"
  (cd classic && find . -type f ! -name FROZEN.md | sed 's#^\./##' | sort | while read -r f; do echo "| $f | $(sha256sum "$f" | cut -c1-64) |"; done)
} > classic/FROZEN.md
echo "frozen $(echo $done_list | wc -w) assets + index.html from $sha"
