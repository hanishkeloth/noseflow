# Contributing to Noseflow

Use Node 22.13 or newer. Run `npm ci`, then `npm run dev`. Before submitting a pull request, run `npm test`.

Keep camera processing local and optional. Every interaction must retain pointer/touch and keyboard fallback. Add a focused regression test for changes to input math or credential routing. Do not commit API keys, generated media with unclear reuse rights, or a private Site project ID. Describe live-device testing separately from build/unit checks.

Scene geometry and shaders live in `lib/scene.mjs`; input math and URL validation in `lib/motion.mjs`; the user interface and generation lifecycle in `app/page.tsx`.
