---
title: keymaster independent static hosting checkpoint
date: 2026-10-22
register: FOR AGENTS
status: checked
---

# Scope

Preserve app content, styling, interaction and browser data. No AI calls exist; add no key UI. No deployment, DNS change, GCP deletion or licence change.

# Implementation plan

1. Pull clean main; create `feat/independent-static-hosting` (completed).
2. Remove unused environment-key injection and runtime import maps. Connect the React entry point.
3. Bundle Tailwind, fonts and existing JavaScript dependencies. Commit reproducible npm lockfile.
4. Add credential-free static hosting and Cloudflare Pages instructions.
5. Run clean npm installation, typecheck, production build and browser mounted-content/interaction checks. Record exact results here.
6. Commit and push the feature branch for independent review.

# Checks and limitations

- `npm ci --no-audit --no-fund --cache .npm-cache`: passed from the committed lockfile (141 packages).
- `npm run typecheck`: passed.
- `GEMINI_API_KEY=STATIC_BUILD_TEST_SENTINEL API_KEY=STATIC_BUILD_TEST_SENTINEL npm run build`: passed without real credentials (1,713 modules; JavaScript approximately 378 kB).
- `npm run check:static`: passed; bundled module entry, CSS and local fonts; no forbidden runtime CDN references or sentinel in output.
- T3 background browser against production preview: mounted KeyMaster heading; 685 landing-page text characters; original indigo button colour and Inter font; zero external landing-page resource requests.
- Browse Database: 73 shortcut headings. Added bookmark `cc-1`, reloaded and confirmed persistence; removed test bookmark afterwards.
- Evidence: `evidence-keymaster-static-browser.json`. T3 accessibility snapshots timed out; DOM evaluation and locator clicks succeeded. Full practice curriculum and every viewport were not exhaustively tested.
- Local storage keys and app content/logic unchanged. Changing hosting origin will not transfer browser storage automatically.
- No deployment, DNS/GCP changes, licence changes or paid model calls. npm reported unapproved optional install scripts; build and typecheck still passed without changing the machine policy.

# Handoff

Feature branch: `feat/independent-static-hosting`. Commit contains this checkpoint. Prepared for independent review; production hosting unchanged.
