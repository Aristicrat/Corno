# Corno

This project is a React + Vite tuning app with:
- Real-time microphone pitch detection
- Dynamic tuning color feedback (fast only while tuning)
- Calm iOS-style glass UI with slow ambient color transitions

Original Figma source: https://www.figma.com/design/xgo6n5jNNMEaxvg0qewRsh/Premium-Tuning-App-Flow

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run check
npm run preview
```

## iOS / Xcode (Capacitor)

```bash
npm run ios:sync
npm run ios:open
```

Then in Xcode:
1. Select `App` target and your Apple Team in Signing & Capabilities.
2. Pick an iPhone simulator or connected device.
3. Press Run.

## Optional telemetry

Create a `.env` file and set:

```bash
VITE_TELEMETRY_ENDPOINT=https://your-endpoint.example.com/events
```

If this value is not set, telemetry is disabled.

## Publish checklist

1. Verify microphone permissions in Chrome and Safari.
2. Test on iPhone Safari (`Add to Home Screen`) and desktop browsers.
3. Run `npm run build` and validate from `dist/`.
4. Deploy `dist/` to your host (Vercel, Netlify, Cloudflare Pages, etc.).
5. Ensure privacy page is reachable at `/privacy`.
