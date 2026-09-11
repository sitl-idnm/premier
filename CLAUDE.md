# Премьер — салон красоты — Project Anchor

> **STOP. Read PROJECT_STATE.md immediately before doing anything.**

PROJECT_STATE.md is the single source of truth for this project.

## What this project is

`projects/premier/` — landing + admin panel for the **«Премьер» beauty salon**.

Scaffolded **2026-09-03** by reusing the **technical infrastructure** from
`projects/chaika/` (analytics, admin/личный кабинет CMS, lead pipeline, SEO,
Next/React optimisation) — but **WITHOUT Chaika's design system**. All colors,
fonts, icons, spacing and landing sections are neutral placeholders until the
«Премьер» **Figma handoff** arrives.

## Rules for this project

1. Never write or edit code without reading PROJECT_STATE.md first.
2. **Design system:** every token in `src/shared/styles/global.scss` is a neutral
   PLACEHOLDER. Do NOT reintroduce Chaika's green/orange palette, Inter Tight /
   Arsenal fonts, or rope/trail iconography. Replace tokens with exact values from
   the «Премьер» Figma once it lands (follow the workspace `CLAUDE.md` pixel-perfect
   rules).
3. The technical layer is DONE and must be preserved: analytics (Yandex.Metrika),
   `/admin` CMS + Metrika dashboard, `/api/lead` (Telegram + email + Sheets + VK +
   SmartCaptcha), SEO (metadata / robots / sitemap / manifest), cookie banner, SSR
   content with tagged-cache. See PROJECT_STATE.md → "Reused technical stack".
4. After completing a component, update its status in PROJECT_STATE.md.
5. Landing sections & their CMS content groups are added together: build the
   section, then add its group to `src/shared/content/defaults.ts` +
   `src/app/(admin)/_lib/groups.ts` so it becomes editable in the admin.
