# Coordination folder

Claude (engine) and ChatGPT (interface) talk to each other here. Kevin reads everything and has the final say.

## How check-ins work
Kevin configured asynchronous coordination checks: **ChatGPT at the top of each hour (XX:00 PT)** and **Claude at the half hour (XX:30 PT)** through separate scheduling environments. Each run reads messages addressed to it, independently reviews requested PRs, responds and commits to GitHub following the contract. These are scheduled checks, not continuous watchers or a guarantee the other agent is awake; a user-triggered "check coordination" remains an option. Owners do not need to relay routine messages.

## Every session, first
1. Pull `main`.
2. Read `STATUS.md`, then any file in `messages/` addressed to you with `status: open`.
3. Answer or act on those messages before starting new work.
4. When you finish, update your section of `STATUS.md`.

## Sending a message
Create one new file per message. Never edit someone else's message.

File name: `messages/YYYY-MM-DD-HHMM-<from>-to-<to>-<short-topic>.md` (Pacific time)
Example: `messages/2026-11-21-0900-chatgpt-to-claude-need-hint-text.md`

```markdown
---
from: chatgpt          # claude | chatgpt | coding-agent | kevin
to: claude             # claude | chatgpt | coding-agent | kevin | all
type: request          # request | question | heads-up | answer | decision-needed
status: open           # open | done | wont-do
re:                    # file name of the message this answers, if any
---
What you need, why, and by when.
```

To reply, create a new message with `re:` pointing to the original. Then change only the `status:` line of the original to `done` or `wont-do`.

## When Kevin must decide
Use `type: decision-needed` with `to: kevin`. Lay out the options and your recommendation. Once Kevin decides, record it in `DECISIONS.md`.

## Changing the engine contract
`ENGINE_API.md` belongs to Claude. ChatGPT asks for changes with a `request` message. Claude changes the file, bumps its version, and posts a `heads-up`.

## Commits
- Edits to `coordination/` go straight to `main`. Message: `coord: <what>`.
- Code goes on your branch (`claude/engine` or `chatgpt/ui`) and reaches main through a pull request.

## Code review (required before any merge)
Every pull request is reviewed by the **other** AI: ChatGPT reviews Claude's, and Claude reviews ChatGPT's. Nothing merges without approval. Coding Agent pull requests are cross-reviewed by Codex (Kevin, 2026-11-21). Claude remains paused.

1. **Open the pull request.** The author lists what changed and what was tested, then posts a `heads-up` message here with the PR number.
2. **Review.** The reviewer reads the diff and tries the branch.
3. **One issue per note.** Each finding is its own GitHub issue:
   - Title: `PR #<n>: <short note>`
   - Label: `review`, plus `blocking` if it must be fixed before merge (anything without `blocking` is a suggestion)
   - Body: the file or area, what's wrong or could be better, and why. Link the PR.
4. **Author responds on each issue.** Either fix it and comment `Fixed in <commit>`, or explain why not. The **reviewer** closes the issue once satisfied.
5. **Approve.** When no `blocking` issue for that PR is open, the reviewer posts a review on the pull request (type **Comment**) whose first line is `APPROVED`, and lists the issues it checked. GitHub's real Approve button can't be used: both AIs post as Kevin's account, and GitHub blocks approving your own pull request.
6. **Merge.** The author merges after the `APPROVED` review. Kevin can step in or veto at any point.

