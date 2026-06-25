# How to Update Your GitHub Profile

Your GitHub profile is **100% config-driven**.
All personal information, projects, skills, and links live in one file.

---

## The Only File You Need to Edit

```
config/profile.json
```

This is your single source of truth. Everything else is generated automatically.

---

## Quick Update Guide

### 1. Edit config/profile.json

Open `config/profile.json` and update whatever you need:

| What to change | Where in the JSON |
|---|---|
| Your name, bio, location | `personal` |
| Social links | `contact` |
| Stats cards | `stats` |
| Current focus cards | `focus` |
| Add / update a project | `projects` |
| Tech stack | `techStack` |
| Timeline milestones | `journey` |

### 2. Commit and push

```bash
git add config/profile.json
git commit -m "profile: update [what you changed]"
git push
```

### 3. GitHub Actions does the rest

The workflow at `.github/workflows/update-profile.yml` automatically:
1. Runs `node scripts/generate-readme.js`
2. Regenerates all SVGs in `svg/`
3. Commits and pushes the updated `README.md`

You'll see the updated profile in ~30 seconds.

---

## Manual Generation (local preview)

```bash
node scripts/generate-readme.js
```

This writes `README.md` and `svg/*.svg` locally so you can preview before pushing.

---

## Adding a New Project

In `config/profile.json`, add an entry to `projects`:

```json
{
  "id": "my-new-project",
  "name": "My New Project",
  "category": "Category · Label",
  "description": "Short description of the project.",
  "stack": ["React", "Node.js", "PostgreSQL"],
  "github": "https://github.com/harish-ram247/repo-name",
  "demo": "https://example.com",
  "status": 75,
  "theme": "cyan",
  "architecture": [
    "Step 1",
    "Step 2",
    "Step 3"
  ]
}
```

`theme` can be: `cyan`, `purple`, `green`, `gold`

`architecture` is optional — removes the right-side diagram if empty `[]`.

---

## Adding a Social Link

In `config/profile.json`, add the value to `contact`:

```json
{
  "contact": {
    "leetcode": "https://leetcode.com/harish-ram247"
  }
}
```

The footer automatically shows only links that have values. Empty strings are hidden.

---

## Folder Structure

```
.
├── README.md                 ← auto-generated (never edit directly)
├── config/
│   └── profile.json          ← YOUR CONFIG FILE
├── svg/
│   ├── hero.svg
│   ├── stats.svg
│   ├── connector.svg
│   ├── tech-stack.svg
│   ├── journey.svg
│   ├── connect.svg
│   └── projects/
│       ├── powersense.svg
│       └── ...
├── scripts/
│   ├── generate-readme.js    ← main generator
│   ├── svg/                  ← section generators
│   └── lib/                  ← utilities
└── .github/
    └── workflows/
        └── update-profile.yml
```
