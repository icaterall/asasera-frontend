# asasera-frontend

Bilingual (Arabic/English) React front end for Asasera. See `README.md` for the architecture.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Uploaded media — non-negotiable

The rule and its mechanism live in `asasera-backend/CLAUDE.md` → **Uploaded
media**. Every upload is an `assets` row with model-read content analysis, and
is erased from S3 when the last reference to it goes — including when the
teacher deletes the image, the choice, the question or the activity.

What this front end must not do:

- **Never render or store a bucket URL.** Images resolve through
  `POST /activity-media/resolve` into a short-lived signed route (`useImage`).
  A URL kept in a payload, a cache or a link outlives every permission check.
- **Never imply a deletion the server has not been told to make.** Clearing an
  image from a payload is what releases it, and only on save.
- **Any new payload field that can hold an image key needs its backend
  counterpart in `questionMediaKeys()` in the same change** — otherwise the
  picture uploads, shows here, and is swept from S3 as unreferenced.
