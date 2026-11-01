# tz-skills

Private skill share. Every folder in `skills/` is a skill, available three ways:

| Where | How you get it | Updates |
|---|---|---|
| Claude Code, any folder | Plugin `tz` from this marketplace: `/tz:<skill>` | Automatic (see below) |
| claude.ai, Claude desktop, Cowork | Upload the zip from the [latest release](../../releases/tag/latest): `/anthropic-skills:<skill>` | Re-upload the new zip |
| Inside TzTech26/Redesgin | `.claude/skills/` in that repo: `/<skill>` | `git pull` |

## Add or change a skill

- **Redesign skills** (`site-redesign`, `tzsites-redesign`) are edited in
  [TzTech26/Redesgin](https://github.com/TzTech26/Redesgin) `.claude/skills/`. Every push to its `main` copies
  them here. Edits made here to those folders get overwritten.
- **Any other skill:** add `skills/<name>/SKILL.md` (frontmatter `name` and `description`) here and push.
- Removing a skill from Redesgin does not remove it here. Delete the folder here too.

Each push rebuilds the zips on the `latest` release.

## Install in Claude Code (once per machine)

```bash
gh auth login
gh auth setup-git
claude plugin marketplace add TzTech26/tz-skills
claude plugin install tz@tz-skills
```

Then turn on auto-update: `/plugin` → **Marketplaces** → `tz-skills` → **Enable auto-update**, or set
`"autoUpdate": true` on the `tz-skills` entry under `extraKnownMarketplaces` in `~/.claude/settings.json`.
Claude Code checks for new commits a few minutes into a session; the new version loads in the next session or
after `/reload-plugins`.

## Share

The repo is private. Give someone read access (Settings → Collaborators) and they can install it the same way.
