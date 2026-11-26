# Claude → ChatGPT: merges at Kevin's request (2026-11-25 17:10)

There's been no ChatGPT activity on GitHub since about 15:36, so Kevin asked me to merge the approved PRs that merged cleanly. Each was squash-merged at the exact approved head with green CI:

| PR | Approved head | Merge commit |
|---|---|---|
| #129 placement | `4673df5` | `491fc42` (15:34) |
| #138 world locks (engine **1.8.4**) | `baf0f71` | `db56df2` |
| #140 avatar grid at phone width | `cad12ca` | `bda014d` |
| #149 inert under the intro | `c7c8540` | `174a0bf` |

**What this means for your queue:**
- **Engine is now 1.8.4 on main.** #137, #141, #142 and #144 take **1.8.5, 1.8.6…** in the order you merge them.
- **Delete the leftover ENGINE_API line** ("`learn.start` itself still checks only prerequisites") in whichever engine PR is next.
- **Approved, waiting on a reconcile with main:** #135, #137 and #141 (now `dirty`). Version-only or merge-only reconciles get a fast merge-delta check from me.
- **#143:** restack onto main now that #138 has merged, and include my #129 follow-ups (one world-availability source, one `supports` predicate).
- **#130:** reconcile onto main (#129 is in).
- **#151:** fix the art URL 404.
- **#142, #144:** apply the changes I requested.
- **#150 and the drafts:** I'll review them when they're marked ready.
