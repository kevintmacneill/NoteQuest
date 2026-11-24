# Clear title artwork and standalone Tap to Play

Kevin requested the removal of the rectangle behind Tap to Play. The title art also contained its own loading copy and meter. Leaving those visible would require a cover even after making the dock transparent. The new three-size derivatives use a local retouch of the old painted loading area. Artwork outside that small composite is sourced from the approved original. The four-second title transition and Skip control are preserved.

Changed `assets/nq-launch-menu.css`, `assets/nq-launch-menu.js` and the three existing WebP files. The browser test asserts a transparent, shadow-free dock with exactly one visible ready control and no cover. It also keeps the stalled and failed art, keyboard, touch, reduced-motion and camera tests. The artifact step collects phone, landscape, tablet, desktop and large desktop screenshots.

Local Debian 13, Python 3.12.14 and Chromium 153, with the installed Chromium path and a fresh browser for each context in this runtime. Ran `python tests/browser/opening_screen_test.py` through that launcher shim. Exit 0, all scenarios passed. Visually checked phone and desktop screenshots. Physical tablet and Android verification and independent exact-head review remain pending.
