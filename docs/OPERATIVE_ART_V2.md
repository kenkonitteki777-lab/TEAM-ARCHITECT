# Operative artwork v2 — first two characters

Date: 2026-10-08. Baseline: `2688c315f3fe285e58f6f4f8639157da175259a0`.

Original fictional role illustrations, not likenesses of the registered people and not MBTI-based ability judgements. Built-in image generation was used. Original generated files remain available as generated images; lightweight WebP derivatives are versioned in this repository.

## Production prompt set

Shared direction: premium mature strategy-game business character concept art; semi-realistic cinematic rendering; navy/ink/steel palette; readable sculpted facial lighting, realistic fabric and fine metallic detail; centered upper body to hips with complete shoulders and hands; original fictional Japanese male role archetypes; no lettering, logos, weapons, cyber armor or caricature. Transparent output requested and existing alpha preserved during resizing/encoding.

Commander: early40s, broad authoritative but approachable silhouette, swept-back short dark hair with subtle grey temples, tailored double-breasted charcoal/navy business jacket, dark open-collar shirt, restrained brass role pin, planning folio at waist. Warm amber rim light, cool blue fill; heavy wool, precise lapels and metal texture.

Strategist: mid30s, slim angular silhouette, neatly side-parted black hair, thin titanium rectangular glasses, focused calm expression, clean shaven, ink-blue single-breasted jacket over charcoal high-collar knit, subdued cyan geometric pin. Holds and touches a steel analysis tablet. Cool cyan rim light with restrained amber fill. Match commander's cinematic art direction.

## Repository assets

| Asset | Size | Use |
|---|---:|---|
| `public/operatives/commander-v2.webp` | 57,662 bytes | Commander hero, 640×960 |
| `public/operatives/commander-v2-small.webp` | 16,950 bytes | Commander small cards, 280×420 |
| `public/operatives/strategist-v2.webp` | 51,754 bytes | Strategist hero, 640×960 |
| `public/operatives/strategist-v2-small.webp` | 15,462 bytes | Strategist small cards, 280×420 |

Total: 141,828 bytes. Existing SVG illustrations remain for the other five members. Existing version1 artwork logic is retained for rollback. Hero images load eagerly; below-fold cards load lazily. All consuming screens use the same component and stable member IDs. Hover movement respects reduced-motion settings. No new runtime dependency or paid API connection.

## QA

- Typecheck and production build passed.
- 16 domain tests passed.
- 10 desktop/mobile E2E tests passed, including mission creation, independent hierarchy, command editing, save/reload, backup restoration, corrupt-data protection and interview answer navigation.
- Original artwork, 1440px desktop and 390px mobile screenshots inspected.
- Browser verified loaded image dimensions, role-card navigation and no document overflow at 360/390/430px.
- No local application page errors.
- Interview application source, storage schema, rule engine and infrastructure are unchanged by this release.
- Public verification to be recorded after deployment. User Android device not yet verified.

Next artwork task: carry this established direction into the other five roles, each with distinct silhouette, pose and job-relevant prop. Do not infer actual appearances or personality from MBTI.
