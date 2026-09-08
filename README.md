# Noseflow

**A living Three.js canvas that follows your nose.**

An MIT-licensed interactive design template by [Hanish Keloth](https://github.com/hanishkeloth). Four animated worlds, local face tracking, pointer/touch fallback, and fal-generated atmospheres.

## Features

- 18,000 additive particles: Aurora bloom, Orbital silk, Solar current.
- Smoothed nose-tip input using MediaPipe Face Landmarker; camera permission is opt-in.
- Speed, expansion and sensitivity controls; pause; reduced-motion preference.
- fal FLUX.1 schnell text-to-image atmosphere generation using your own key.
- PNG export of the transparent particle canvas (background and UI are excluded).
- Responsive desktop and mobile layout.

## Run

Requires Node 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Camera access needs localhost or HTTPS. Internet access is required for the pinned Three.js and MediaPipe CDN modules and face model. The 3D renderer uses WebGL for broad compatibility; it is not a WebGPU implementation.

```sh
npm run build
```

The included Vinext/Cloudflare build produces a Worker deployment, not a GitHub Pages static export. The public template omits the hosted Site identity.

## fal setup and privacy

Enter your own fal API key in the playground and press Generate atmosphere. Generation uses your fal credits. The key is held only in React memory and sent directly to `https://queue.fal.run`, never saved to localStorage or committed. Refreshing clears it. Do not embed a shared production key in this frontend; a shared-key service needs an authenticated, rate-limited server proxy. Third-party browser modules run within the page, so use a limited personal key on a deployment you trust.

Camera frames are processed locally by MediaPipe. Text prompts and previously generated stills selected for animation are sent to fal; no camera frames or face coordinates are uploaded. Turn camera off to stop the media tracks. The browser still downloads the third-party tracking model and modules.

## Remix

`app/page.tsx` contains the particle scenes, input smoothing, tracking lifecycle, controls and fal queue integration. `app/globals.css` controls the visual theme and responsive layout. Change the preset functions to introduce a new form, and preserve the pointer fallback and camera cleanup.

## Research direction

This first edition combines shader-like additive particle aesthetics, input-driven spatial motion, local face landmarks and generated backdrops. It does not claim to implement every trend or that its model is the newest available. See [RESEARCH.md](RESEARCH.md) for the verified starting sources. Daily research should inform substantive new templates and improvements rather than arbitrary version churn.

## Validation and limits

Production build validated in the authoring environment. Webcam permission, live face tracking, CDN loading and paid fal generation require testing on actual target devices; no claim of end-to-end browser validation is made. Devices with weak GPUs may need a lower particle count. Face inference runs at approximately 15 Hz on the main thread and can cause jank on slow devices; a worker is a useful production improvement.

## License

MIT for this repository's original code. External libraries and model assets retain their own licenses and usage conditions.

## Lightfield update (v0.2)

Lightfield adds a fourth scene: four animated 3D ribbons, additive edge lighting and head-driven camera parallax. The existing particle scenes now animate in a vertex shader instead of rewriting 18,000 positions on the CPU each frame. This is WebGL with stylized glow, not an implementation of the unreleased Three.js SunLight changes or a volumetric lighting engine.

- Enable the camera, look straight ahead and use **Recenter motion** to calibrate your neutral pose.
- With the camera off, move your pointer, drag on touch, or focus the canvas and use the arrow keys. Press R to recenter.
- Missing face input returns to neutral; rendering and inference skip hidden tabs.
- Generate a still with FLUX schnell, then optionally select **Animate backdrop** to request a five-second 768p H3 Max Turbo clip. Generated still images are sent to fal for this second step; webcam frames are not.
- Video playback follows Pause and reduced-motion preference. A generated clip is not guaranteed to form a seamless loop.

### Video cost

See [current fal pricing](https://fal.ai/models/minimax/h3-max-turbo/image-to-video) before submitting. A paid request can continue remotely if the page is closed or local polling times out. No generation occurs until you explicitly click a generation button. Keys remain in page memory only. Use a limited personal key and a deployment you trust.

### Checks

`npm test` builds the app and runs tests for rendered controls, frame-rate-independent smoothing, calibration, input bounds, and fal URL-origin validation, together with the starter UI component checks. Live webcam and paid fal integration tests are not included. Browser GPU output, actual-device frame rates, camera permission flows and generation must be checked on target devices before claiming production performance.

### Deployment

This repository is a Vinext/Cloudflare Worker app. It is not a static GitHub Pages export. Deploy the verified `dist/server/index.js` Worker and `dist/client` assets with a compatible Cloudflare deployment flow. The public template's `.openai/hosting.json` has no private Site project identity. CI validates the project but does not deploy or consume fal credits.
