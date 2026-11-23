# Browser tests (Chromium via Playwright)
- `full_game_test.py`: plays every screen on `index.html` and checks that saves from the old live version load. Expect 50/50.
- `pets_flow_test.py`: eggs and hatching, soap, bags and sleeping on the current screens (claude/pets and later). Expect 12/12.

Run with `python3 tests/browser/full_game_test.py` from the repo root. Set `NQ_INDEX=/path/to/index.html` to test another checkout.
They need `pip install playwright && playwright install chromium`.
