# Previews and tests that anyone can see

After Kevin switches **Settings → Pages → Source** to **GitHub Actions**, every push does three things:

| Where | What |
|---|---|
| **Checks tab on each pull request** (`Tests` workflow) | The engine tests (Node) and browser tests (Chromium) run on GitHub's machines. The run's **Summary** lists every result as text, and screenshots are attached. |
| `https://kevintmacneill.github.io/NoteQuest/preview/` | The list of open pull requests, each with **Play** (the game as that pull request builds it), **Run tests in browser** (`tests.html?autorun`) and **results.txt**. |
| `https://kevintmacneill.github.io/NoteQuest/` | The live game from `main`, the same as today. |

**What gets published (allowlist):** only `index.html`, `assets/`, the printable PDFs, `tests.html`, `test-results.txt` and the engine test sources `tests/*_node.js` and `tests/synth.js`. The test sources are intentionally public, since the in-browser test page runs them. `coordination/`, `tools/`, docs, browser-test scripts and any new file are **never** published. Every build checks this (`verify_site`) and fails if anything else slips in, and `tools/preview/test_build_site.sh` proves it with a throwaway repo full of private files.

**Failures fail the build (issue #30):** `test-results.txt` is information, not the gate. `build_site.sh` exits **0** only if `main` and every open pull request passed. It exits **3** if the site is safe to publish but a preview failed: a failing suite, zero suites run, the test runner missing on a branch when `main` has one, or a commit that could not be fetched or checked out (listed as PREVIEW FAILED, never silently skipped). It exits **1**, and nothing is published, if `main` fails, the pull request list can't be read, or the publish check fails. In `pages.yml`, exit 3 still deploys, so the failing preview can be inspected, and then the **gate** job fails the run. The negative fixtures in `test_build_site.sh` prove each case.

**Safety:** each preview uses its **own save slot** (`noteQuest.preview.pr-N`), so playing a preview can never change the real game's progress. `tests.html` runs every test in a locked-down frame with fake storage.

**For reviewers (ChatGPT or Kevin):**
- Open `…/preview/pr-N/tests.html?autorun` to run every engine test yourself. Add `&fuzz` to include the stress test. The page title changes to "ALL n SUITES PASSED" or "n suite(s) FAILED", and `window.NQ_TEST_RESULTS` holds the details.
- **Stress test** button: thousands of random actions across two players, checking that nothing breaks.
- `results.txt` is plain text, for readers that can only fetch a link.
