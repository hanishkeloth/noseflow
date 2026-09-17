# Orbit Recorder implementation — 2026-09-17

Extends the existing Noseflow repository. Implements the local camera-path part of the September 16–17 research direction, plus visibility-aware rendering and inference. No new repository, generated media, model training, paid export submission, PBR map loader or renderer migration.

## Design decisions

- Keep the existing pinned Three.js r186 WebGL renderer and five scenes.
- Record all five seconds at at most 30 Hz, then reduce to 2–12 keyframes by normalized interpolation error. A 30-point ring buffer is inadequate for retaining the whole performance.
- Camera controls: smoothed nose/pointer X maps to ±55° azimuth, Y to ±20° elevation, a separate distance slider covers 0.75–1.25×. This is a gesture mapping, not an estimate of anatomical head angles or depth.
- Explicitly freeze procedural scene time/rotation during capture/replay. Editor settings are not serialized. Manual path edits are validated for finite, ordered camera values.
- Cancel RAF loops when hidden/offscreen, reset render delta on resume, stop partial takes, reject hidden tracking results. Keep at most one camera bitmap in flight. Existing tracking workers and streams remain local.
- Keep downloadable path JSON separate from the fal endpoint/input recipe. The recipe has a visible image-URL placeholder and triggers no network call.

## Sources and boundaries

- [Official fal camera-controls schema](https://fal.ai/models/minimax/h3-max/camera-controls/api), checked September 17, 2026: normalized keyframe times, degree angles, normalized distance; recipe uses `camera_trajectory`, `resolution: "768P"`, `duration: 5`, `prompt_expansion_mode: "disabled"`. Pricing is intentionally not frozen into code.
- [Three.js TextureNode development fix](https://github.com/mrdoob/three.js/commit/eabc262db760c5e85bd890a6dc627ba14e70e8c3), from the research brief, is not vendored or treated as an installed fix. Existing Tilt Studio material filters/types are not mutated at runtime. Atomic imported-PBR map swaps need a future loader before that test applies.
- [Environment rotation development fix](https://github.com/mrdoob/three.js/commit/92b71a529a1ecb88e1b2bb6256466a86e73cf51b), from the research brief: current scene already uses an explicit light rig, no rotating environment map.

## Follow-up build backlog

1. Add actual Surface Stories/Material Reveal map import with stale-load rejection, atomic swaps, cleanup, and a 30-swap resource test.
2. Add optional still capture aligned with a selected trajectory frame. Existing PNG captures only the transparent 3D canvas, excluding HTML/backdrop media.
3. If paid trajectory export is added, use authenticated server-side credentials, show a freshly checked cost, require an explicit submission, and distinguish local preview from model output.
4. Measure real webcam, mobile GPU and accessibility behavior before claiming production performance. No raw camera footage should enter exported paths.

Original code: MIT. Three.js and tracking/model assets retain their respective licenses; generated media and hosted fal usage retain separate terms.
