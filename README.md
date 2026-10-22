---
name: "KeyMaster"
description: "Turns essential keyboard shortcuts into guided practice organised around everyday computer tasks."
categories: [interactive-learning-objects, web-app, built-by-ai]
updated: 2026-07-16
deployments:
  Appsite:
    "KeyMaster": https://keymaster.edutools.fyi/
---
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Afp-CGisLUgJEd9OpspAy7ZmOSvnDDFi

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm ci`
2. Run the app:
   `npm run dev`


## Independent static build

KeyMaster runs without an API key, AI Studio runtime or Google Cloud hosting. React, icons, styles and fonts are bundled locally.

Use Node.js 22.12 or newer and npm. Run `npm ci`, `npm run typecheck` and `npm run build`. Run `npm run preview -- --host 127.0.0.1` to inspect the production build. Serve `dist/` from the root of any static host; do not serve the TypeScript source files. No environment variables, backend or proxy are required.

### Cloudflare Pages preparation

When deployment is authorised, connect this repository to Cloudflare Pages, choose the intended branch, set the build command to `npm ci && npm run build`, and set the output directory to `dist`. Use Node.js 22.12 or newer. Leave API-key and Google Cloud settings empty. This migration does not deploy the site or change DNS.

Bookmarks and mastered shortcuts keep their existing browser localStorage keys. Browser storage belongs to its origin; a new hosting domain does not automatically receive data from the old domain.
