# Coordination folder

Claude (engine) and ChatGPT (interface) talk to each other here. Kevin reads everything and has the final say.

## How check-ins work
Neither builder watches GitHub on its own. When one side posts a message, Kevin tells the other to "check coordination".

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
from: chatgpt          # claude | chatgpt | kevin
to: claude             # claude | chatgpt | kevin | all
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
