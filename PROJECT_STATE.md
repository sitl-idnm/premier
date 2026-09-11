# Project State: Премьер (салон красоты)

## Meta
- **Figma URL**: file `mKTvNmKTTEW4S89Bha0xKA` — desktop home `31:821` (1200px), mobile home `31:2080` (360px)
- **Boilerplate**: reused from `projects/chaika/` (which is based on
  https://github.com/pandaprofit/nextjs-boilerplate)
- **Started**: 2026-09-03
- **Last Figma sync**: 2026-09-10
- **Overall status**: 🔄 Pixel-perfect build in progress (see plan)

## Design system (extracted 2026-09-10)
- **Fonts**: headings `Monomakh Unicode` (self-hosted `src/app/fonts/MonomakhUnicode.otf`, uppercase, 55px/65px), body `Inter` (Google). Vars: `--font-heading`/`--font-logo`, `--font-ui`/`--font-body`.
- **Palette**: page `#FCFCFA` · beige `#F2EDE5` (`--light-*`/`--beige`) · beige-deep `#E2DDD3` · text/heading grey `#808080` (`--gray-text`, `--text-*`) · dark/footer `#333333` (`--ink`/`--footer-bg`) · CTA green `#007965` (`--green-main`) · footer text `#CDCDCD` · strokes `#CBCBCB`.
- **Radii**: pill 40 (`--radius-button`), card 20 (`--radius-card`), card-lg 29, panel 30, small input 10.
- **Layout**: container 1200px, gutter 20px. Breakpoints $tablet 900 / $mobile 560 (mobile frame 360; tablet inferred).

---

## Scaffolding decisions (2026-09-03)

Prepared by cloning Chaika and **stripping its design system**, keeping only the
reusable technical layer. Two choices confirmed with the client:
- **UI shell** → neutral skeleton (header/footer/modal/cookie kept as working,
  brand-free placeholders; site builds and runs).
- **CMS content model** → only design-agnostic groups kept (contacts, meta,
  header, footer, forms, modals, legal). Landing-section groups (hero, services,
  prices, etc.) are added when the Figma defines the sections.

---

## Reused technical stack (DONE — preserve)

| Area | What | Key files |
|------|------|-----------|
| Analytics | Yandex.Metrika counter + goals, UTM capture, tracked links | `src/components/analytics/*`, `src/shared/lib/metrika.ts`, `utm.ts` |
| Личный кабинет | `/admin` CMS (data-driven editor over content tree) + Metrika dashboard, single-password HMAC gate | `src/app/(admin)/*`, `src/app/api/admin/*`, `src/middleware.ts`, `src/shared/lib/adminAuth.ts`, `metrikaStat.ts` |
| Content / SSR | `getSiteContent()` deep-merges Supabase override over defaults, tagged-cache revalidation | `src/shared/content/*`, `src/shared/lib/siteContentStore.ts` |
| Lead pipeline | `POST /api/lead` → Telegram + email (SMTP) + Google Sheets, in parallel; Yandex SmartCaptcha; RU phone mask | `src/app/api/lead/route.ts`, `src/shared/lib/notify/*`, `captcha.ts`, `phone.ts`, `leads.ts` |
| VK Ads → Sheets | webhook + cron sync to Apps Script Web App | `src/app/api/vk/*`, `src/shared/lib/vk.ts`, `sheets.ts`, `scripts/apps-script-sheets.gs` |
| SEO | metadata (generateMetadata), robots, sitemap, manifest, cookie banner | `src/app/(site)/layout.tsx`, `src/app/robots.ts`, `sitemap.ts`, `manifest.ts`, `src/components/cookie/*` |
| Next/React opt. | SVGR webpack, App Router route groups `(site)`/`(admin)`, server components + client prop slices, Jotai provider | `next.config.mjs`, tooling in `package.json` |

**Renamed from Chaika:** Supabase table `premier_site_content`; cookies
`premier_utm` / `premier_admin` / `premier-cookie-accepted`.

---

## Design tokens — ⚠️ ALL PLACEHOLDER

`src/shared/styles/global.scss` holds neutral greyscale tokens + one neutral
accent so the app builds. **Replace every value from Figma.** CSS variable *names*
are intentionally stable (e.g. `--green-main`, `--orange-main`, `--space-x*`,
`--radius-*`) so existing SCSS modules reskin without renaming — but the values
are NOT the Премьер brand. Fonts are the system stack (root layout has no
`next/font` yet — wire real fonts on handoff).

Fill these from Figma (see workspace `CLAUDE.md` extraction rules):

| Group | Status |
|-------|--------|
| Colors | ✅ from Figma |
| Typography / fonts | ✅ Monomakh (local) + Inter |
| Spacing | ✅ retuned |
| Radii | ✅ from Figma |
| Icons | ✅ exported per section |
| Logo | ✅ SVG from Figma (node 47:994) |
| Favicon / PWA | ✅ brand mark (green #007965 + beige «П»): `src/app/icon.svg`, `public/icon-192/512.png`, `src/app/apple-icon.png` — swap for exact Figma mark when render quota frees |

---

## Pages
- `/` — placeholder home (`src/views/home/home.tsx`), awaiting sections
- `/privacy`, `/rules` — legal pages wired to CMS `legal.*` (placeholder text)
- `/admin/*` — CMS + Metrika (functional)
- 404 — `src/app/not-found.tsx` (neutral)

---

## Component Registry

| Component | Type | Status | File Path | Notes |
|-----------|------|--------|-----------|-------|
| Header | module | ✅ done | `src/modules/header/` | logo + centered beige nav pill + green «Записаться»; mobile burger |
| Footer | module | ✅ done | `src/modules/footer/` | dark #333333, white logo, legal cols, WhatsApp icon |
| Logo | ui | ✅ done | `src/ui/logo/` | CSS-mask, dark/light variants (logo.svg / logo-light.svg) |
| Booking modal | component | ✅ functional | `src/components/modal/` | name+phone+consent → /api/lead |
| Cookie banner | component | ✅ functional | `src/components/cookie/` | neutral |
| Admin panel | app | ✅ functional | `src/app/(admin)/` | recolored via tokens; groups for all sections |
| Hero (Обложка) | section | ✅ done | `src/views/home/sections/hero/` | scaled cqw canvas + mobile stack |
| Акции (promos) | section | ✅ done | `.../promos/` | 2 promo cards + glass «все предложения» card |
| Выбор салона | section | ✅ done | `.../salons/` | 2 salon cards (metro badge, photo, CTA) |
| Цены (прайс) | section | ✅ done (данные плейсхолдер) | `.../prices/` | salon segmented control → category tabs → price list; **prices are PLACEHOLDER — import from Figma 58:1839** |
| О нас | section | ✅ done | `.../about/` | text + real cloud SVG (`about-cloud.svg`) + oval photo carousel |
| Портфолио | section | ✅ done | `.../portfolio/` | full-width centered 4-up gallery (scroll on ≤tablet) |
| Сертификаты | section | ✅ done | `.../gifts/` | **3-layer envelope** (`Envelope.tsx`) + GSAP scroll animation (photo tucks in) |
| Программа лояльности | section | ✅ done | `.../loyalty/` | photo + benefits list |
| Отзывы | section | ✅ done | `.../reviews/` | real Yandex widgets + restored quote |
| Карта салонов | section | ✅ done | `.../locations/` | 2 address cards with maps |
| Legal /privacy /rules | pages | ✅ done | `src/app/(site)/privacy|rules/` | reskinned, Monomakh titles, header clearance |
| 404 | page | ✅ done | `src/app/not-found.tsx` | inherits tokens |

Status: ⬜ Todo / ⚠️ Placeholder / 🔄 In Progress / ✅ Done

---

## TODO when handoff arrives
1. Parse Figma URL, run MCP extraction (workspace `CLAUDE.md` steps 4–6).
2. Replace all tokens in `global.scss`; wire real fonts in `src/app/layout.tsx`.
3. Build sections; for each, add its CMS group to `defaults.ts` + admin `groups.ts`.
4. Replace favicon/PWA icons (`src/app/icon.svg`, `public/icon-192.png`,
   `public/icon-512.png`, `apple-icon.png`) with Премьер marks.
5. Fill real contacts, legal text (privacy/rules), SEO copy in `defaults.ts`.
6. Env for prod: create `premier_site_content` Supabase row/table, set all secrets
   (Telegram/SMTP/Sheets/captcha/Metrika/admin) per `.env.example`.

---

## Implementation Notes
- **Figma API rate limit (2026-09-10):** starter-plan 429s throughout. Two
  endpoints behave differently: the **raw-image (imageRef) endpoint** allows a
  small batch, the **node-render (flat PNG) endpoint** 429s almost immediately.
  - ✅ Now hi-res (native): hero (all), logos + metro/social icons, salon photos,
    about photo, **promo-1/2, promo-deco, portfolio-1/2/cta, loyalty-photo, map-1/2**.
  - ⏳ Still scale-1 reference crops (node-render endpoint blocked): `about-visual`
    & `gift-visual` (baked composites — blob+photo / beads+frame) and
    `review-ornament`. Re-export via node render when quota frees:
    `31:884` (about, scale2 → crop x≥1170), `31:941` (gifts, scale2 → crop x≥1170),
    `31:1024` (review ornament, scale2). Ideally also split about/gift into
    separate photo + ornament so photos become swappable.
- Decorative pieces approximated in CSS (rate-limit): promos top beige blobs
  (`.blob1/2`). Fine visually; replace with the real khokhloma ornament if needed.
- Pixel method: decoration-heavy sections use a `container-type: inline-size`
  canvas + `cqw()` (see `func.scss`) → exact at 1200, proportional below. Column
  sections use flow + exact px. Mobile (≤560) uses the Figma mobile frame (360).
- Header is `position: absolute` (overlay) so its Figma coords live inside the
  hero frame; legal pages add `padding-top` to clear it (`privacy.module.scss`).
- **Real data wired from premiersalon.ru (2026-09-10):** phones (Фадеева
  +7 495 150-91-11 / Таганская +7 495 911-00-19), addresses, hours (10:00–22:00),
  email Info1@premiersalon.ru, Telegram @premiermoscow, legal (ООО «ПРЕМЬЕР»,
  ИНН 7709837627, ОГРН 1097746558535, лиц. ЛО-77-01-021789).
- **Hero «Скидка 20%» card** is now a real interactive component
  (`hero/HeroCard.tsx`, self-scaling container-query), button opens booking modal
  — no longer a flat PNG. Radius 10px (fix: `.cardSlot`/`.mCardSlot` are the
  container so `cqw` radius resolves to the 253px card, not the 1200 canvas).
- **«О нас» is now a real gallery** (`about/AboutGallery.tsx`, client carousel):
  scalloped beige «mirror» frame (`public/icons/about-frame.svg`, generated) +
  circular auto-rotating photo carousel with dots. Was a baked composite
  (`about-visual.png`, removed). Frame is a CSS/SVG approximation of the Figma
  soft-cloud shape (Figma asset unavailable — API rate-limited); gallery seeded
  with interior photos (`about-photo`, salon photos) — client swaps for real set.
  Refined 2026-09-11: frame is now a soft beige **cloud** (regenerated
  `about-frame.svg`, 13 gentle lobes) with a clean **oval** photo on top (Figma
  320×360 r=161.5 → `border-radius: 161.5px / 180px`) — matches the soft-cloud
  reference. Exact cloud vector still pending render-quota re-export.
- **Favicon/PWA** replaced boilerplate placeholder with a «Премьер» brand mark
  (green field + beige «П»): `src/app/icon.svg`, `public/icon-192/512.png`,
  `src/app/apple-icon.png`. Swap for the exact Figma logo mark when render frees.
- **Prod build verified 2026-09-11:** `yarn build` green — 19 routes, 0 errors
  (only `<img>` LCP warnings). QA at 1200px: 0 console errors, 0 failed requests.
- **Maps & reviews are real Yandex widgets** (iframes): Locations embeds
  map-widget per salon (oid 97206788511 / 47027037547); Reviews embeds
  maps-reviews-widget per salon. Note: headless QA browser shows CERT warnings
  for yandex.ru (sandbox only) — renders fine in real browsers.
- Placeholder content still to confirm with client: promo titles/descriptions
  («Название акции»/«Описание»), salon «Подробнее» gallery links.
- Static `public/robots.txt` currently `Disallow: /` (blocks indexing while
  unlaunched) and shadows the generated `app/robots.ts`. Remove it at launch.
- `NEXT_PUBLIC_YM_ID` empty → Metrika script no-ops until set.
- `next/font/google` needs network at build ("Collecting page data") — same as
  Chaika; only relevant once real fonts are wired.

## Round 2 — client review fixes (2026-09-11)
- **Layout fixes** (all verified at 1200px vs `.figma-ref/*`): promos subtitle now
  sits beside the last heading line + real smear bg (`promos-bg.svg`) + narrower
  glass card; salons/reviews subtitles pulled back next to the heading (were pinned
  to the far edge by `space-between`); about heading forced to 2 lines (`.left`
  580px); portfolio gallery centered full-width 4-up; gifts + loyalty headings to 3
  lines (measured real glyph widths — loyalty title max-width 490, subtitle absolute
  bottom-right beside «ЧАЩЕ»); reviews quote «Уютно, спокойно…» restored, redundant
  «Смотреть все отзывы» link removed.
- **Real Figma assets placed** (replace prior approximations): `about-cloud.svg`
  (the exact «зеркало» cloud, 661×660), `promos-bg.svg` (652×700 smear),
  `envelope-back.svg` + `envelope-front.svg` + `gift-photo.png` (envelope). Removed
  generated `about-frame.svg` and `gift-visual.png`. Two SVGs are multi-MB (embedded
  rasters) — optional later optimization.
- **Envelope animation** (`gifts/Envelope.tsx` + `Envelope.module.scss`): 3 stacked
  layers (back · photo · front flap); **GSAP ScrollTrigger** (dep `gsap@3.15`,
  helper `src/shared/lib/gsap.ts`) scrubs the photo from raised/tilted to resting
  «inside» the envelope; honors `prefers-reduced-motion`. Free stroke-dash draw is
  the approach reserved for contour ornaments (none present yet — cloud/smear are
  filled, so they use reveal, not draw).
- **Prices block** (`prices/Prices.tsx`, client): salon segmented control →
  category tabs → price list (only selected renders). CMS group `prices` in
  `defaults.ts` + admin `groups.ts`; placed after Salons. **Categories seeded from
  «Премьер Мета.xlsx»; PRICE ROWS ARE PLACEHOLDER** — import exact rows from Figma
  nodes `58:1839` / `148:6368` / `152:7989` (salon selector `31:1728`) when the
  Figma data/render quota frees, or edit via admin.
- **SEO**: `meta.title/description/keywords` enriched from «Премьер Ядро.xlsx»
  semantic core + both locations.
- **Privacy policy**: awaiting client text/link → transcribe verbatim into
  `legal.privacyBlocks` (page already renders it; `highlight.tsx` auto-links
  emails/phones). Old site is anti-bot (403), can't scrape.
- **YClients (future — NOT built; client only flagged it).** To wire online booking
  later: client must provide the **YClients widget embed** (script/overlay) or the
  **company/branch ID(s)** per salon (Таганская / Новослободская), e.g.
  `https://n{n}.yclients.com/company/{companyId}/...`. Integration seam is already
  centralized: every «Записаться» goes through `modalAtom`
  (`src/shared/atoms/modalAtom.ts`) + `CtaButton` (`src/components/cta/CtaButton.tsx`),
  so swapping the custom `BookingModal` form for the YClients overlay is a one-place
  change. Current custom lead form (→ `/api/lead`: Telegram/email/Sheets) stays until
  the embed arrives.
- **Figma still rate-limited (429)** on both data and render endpoints — pending
  extractions: exact price rows/geometry, plus any hi-res re-exports.
