# Research log — 7 September 2026

Primary sources checked while building the first edition:

- [Three.js official site](https://threejs.org/) — r185 shown at lookup; used as the pinned renderer release.
- [Google Face Landmarker for Web](https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js) — local video landmark detection, model setup and synchronous inference caveat.
- [fal queue API](https://fal.ai/docs/documentation/model-apis/inference/queue) — submit, status and result URLs; asynchronous generation lifecycle.
- [FLUX.1 schnell model API](https://fal.ai/models/fal-ai/flux/schnell/api) — an inexpensive starting integration, not a claim to be the latest or best model.

## Daily research criteria

Check official Three.js releases/examples, fal releases/catalog and model documentation, MediaPipe releases, and original open-source interactive design projects. Separate announcements from usable code. Record source links, dates, browser support, asset licenses, actual cost and integration constraints. Select one coherent new interaction rather than copying a competitor's composition. Maintain mouse/touch fallback and avoid sending camera frames to generation providers. Implement changes only when supported by evidence and validate before publishing.

## 8 September 2026 — Lightfield

The Lightfield addition explores local head-controlled parallax and shader ribbons, inspired by current work on atmospheric browser graphics. The September 6–7 Three.js development commits for SunLight, bloom and fog are research references, not dependencies shipped here. Noseflow stays on pinned r185 WebGL and uses additive shading; no benchmark or volumetric-lighting claim is made.

- [Bloom optimization, September 7](https://github.com/mrdoob/three.js/commit/9941685098b927759ceb06931c24eebbdc9ceb70)
- [Fog example improvements, September 7](https://github.com/mrdoob/three.js/commit/f81b9d7f87d0991256b144ceb09482e7c03b6291)
- [SunLight development support, September 6](https://github.com/mrdoob/three.js/commit/1091c70369e47728e0b951ad0ced066e0173588e)
- [H3 Max Turbo image-to-video schema and current price](https://fal.ai/models/minimax/h3-max-turbo/image-to-video)

Implemented: vertex-shader particle animation, a fourth ribbon scene, calibrated input, recentering, arrow-key fallback, face-loss reset, hidden-tab work suppression, and explicit optional fal video generation. Deferred: worker-based face inference, adaptive resolution, physically based lighting, and actual-device performance measurements. The generated background is flat media; foreground ribbons provide real geometric depth.
