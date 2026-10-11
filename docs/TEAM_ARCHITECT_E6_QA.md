# E6 — MBTI character clothes and lighting

2026-10-11 JST. User explicitly requested character redesign by type/group, replacing the previous instruction to retain artwork. Baseline main 0f8cb6728b520d4dfad48014750f6f80d0a494c1.

- All sixteen original portraits were inspected, then individually edited with built-in image_gen to preserve facial identity, hairstyle, pose and held objects. Clothes, lining, scarves and rim lighting now follow purple NT, green NF, blue SJ, yellow SP. Each silhouette/material expresses an individual character: minimalist strategist, textured researcher, structured commander, asymmetric debater; calm adviser, soft idealist, welcoming mentor, lively inspirer; precise organiser, gentle supporter, structured operator, sociable coordinator; utility mechanic, relaxed creator, field troubleshooter, expressive host. These are fictional visual designs, not measurements of real staff capabilities.
- Versioned assets under public/operatives/types/*-e6.webp and *-e6-small.webp. TypePortrait routes archive, pair lab, staff and person/mission portraits to the same new set. Old artwork retained for cached old HTML/JS. No recolour filter or change to real staff MBTI/capability records.
- Export uses ImageMagick only for downscaling/WebP encoding, not creative image editing. 16 large 640×960 and 16 small 280×420 images, 1,406,106 bytes total; small set 324,530 bytes. Individual final prompts and asset paths in TEAM_ARCHITECT_E6_ARTWORK.json.
- Local typecheck/build passed. 40 domain + 25 interview + 46 desktop/mobile browser tests = 111 passed. Tests cover all 16 images loading, group filters, short missions, save failure retention, reload/backup, startup failure recovery and interview model answers. Existing 360/390/430/1440-width checks passed. Local full archive visual inspection confirmed four distinct rows of matching clothes/frames with unchanged faces/poses and no image gaps.
- Scope: TypePortrait mapping, footer E6, new image files and these documentation files only. No interview, Supabase, schema/storage key, mission logic, dependencies or AppDeploy change. Public verification follows after Pages deployment.

Limits: no physical Android-device or workplace outcome measurement.

## Public verification

- Published commit 3cc3558a9f2cf3a8c19724b9eb8e99326ea3b04a. Pages run 38101664976: build and deploy both successful, including complete workflow tests.
- Public root rendered E6; all sixteen small portraits loaded in four group filters. Green ENFJ detail loaded the new large emerald outfit with green rim light; purple ENTP, blue ESFJ and yellow ESFP details also loaded. Detail/return/filter controls responded and updated the selected type. Visual inspection confirmed green clothes and green effects without purple glow.
- Public interview model answer revealed successfully. No user mission/settings/history or database records modified or deleted during public inspection. No app-origin error observed; browser-extension metadata transport messages are outside the application.
- Public verification browser was reconnected after an idle session reset; app itself continued to render and respond. Saved artwork and prompt set remain in repository.

## E6.1 — sixteen-type alignment

2026-10-11 JST. User reported a displaced final type in the People view. The selector used wrapping flex items (mobile basis 18%), producing incomplete rows. Replaced with four equal grid columns at every width (four complete rows, 44px minimum targets). The archive now stretches all cards to equal row heights; intermediate widths use two columns instead of three, keeping all sixteen and four-type groups in complete rows. No type labels clipped, artwork or saved records changed.

Local typecheck/build passed. Existing 46 desktop/mobile UI tests passed; new two-project geometry regression passed at 360,390,430,768,1000,1440px: sixteen buttons, four equal columns, complete final row, equal archive row heights and no horizontal overflow. Initial test navigation assumed an unsupported members query and was corrected to use the real menu; no app routing change. Test browser was restored from the official package registry after temporary binary cleanup; no project dependency change. Public verification follows.

Published alignment commit 56ff56c10bb17624c898d150c22aae56ea0a5dd4, Pages run 38116901648. Public People selector measured four rows of four, each column width 239.5px on the inspected desktop viewport; INTJ/ISTP left edges and ENTP/ESFP right-column positions match. ESFP selection displayed ESFP / エンターテイナー normally. Local six-width geometry covers phone/tablet layouts. No user data edited during public check.
