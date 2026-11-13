# tz-skills

Private skill share. Every folder in `skills/` is a skill, available two ways:

| Where | How you get it | Updates |
|---|---|---|
| Claude Code CLI and the desktop app's Code tab (local sessions) | Plugin `tz` from this marketplace: `/tz:<skill>` | Automatic (see below) |
| claude.ai, Claude Code on the web, desktop app, Cowork | Upload the zip from the [latest release](../../releases/tag/latest) to your account: `/anthropic-skills:<skill>` | Re-upload the new zip |

Claude Code on the web does not install plugins, so there it is account skills.

## The skills

| Skill | Command | What it does |
|---|---|---|
| `site-design` | `/tz:site-design` | Designs and builds a small-business website, from an existing site or from nothing. Self-contained: research, plan, build, test, report. |
| `tzsites-integration` | `/tz:tzsites-integration` | Puts a site into the TZ Sites format in TzTech26/Redesgin: fields, content snapshot, live editor markers, SEO template, Cloudflare preview. Integration only; it calls `site-design` for the design. |

`site-design` needs Node 18+ and Playwright (Chromium and WebKit) and nothing else: no other skill or plugin. Its
folder holds the skill, short reference files it reads per phase (`reference/`), ready components
(`patterns/`) and two check scripts (`checks/`, each with `--self-test`).

`tzsites-integration` needs a checkout of TzTech26/Redesgin (its scripts and templates), `gh`, and for previews a
Cloudflare account whose `workers.dev` subdomain is `tzsites`.

## Add or change a skill

- Every skill lives only here: edit `skills/<name>/SKILL.md` (frontmatter `name` and `description`) and push.
  TzTech26/Redesgin keeps no copy; `tzsites-integration` uses that repo's scripts and templates (`scripts/`,
  `templates/`) by their paths.

Each push rebuilds the zips on the `latest` release.

## Install in Claude Code (once per machine)

```bash
gh auth login
gh auth setup-git
claude plugin marketplace add TzTech26/tz-skills
claude plugin install tz@tz-skills
```

The desktop app shares these settings and plugins with the CLI (local sessions, not WSL). Its **+ → Add plugins**
menu lists the plugin once the marketplace is added.

Then turn on auto-update: `/plugin` → **Marketplaces** → `tz-skills` → **Enable auto-update**. Claude Code
checks for new commits a few minutes into a session; the new version loads in the next session or after
`/reload-plugins`.

## Share

The repo is private. Give someone read access (Settings → Collaborators) and they can install it the same way.
