# Local Checkpoint (2026-02-27)

## Changes
- Menu button and popup now live above the iPhone frame nav overlay so taps stop navigating away.
- Particle field now renders soft glowing points instead of glass squares, matching the requested point-cloud aesthetic.
- Point cloud now renders through a scaled offscreen canvas with cached glow sprites and interpolated target updates so iOS can match desktop smoothness without sacrificing the current look.

## How to review
1. `npm install` (if you haven’t already).
2. `npm run dev` to launch the app and open the tuner page.
3. Click the top-left menu and verify the point cloud behavior while tuning.
