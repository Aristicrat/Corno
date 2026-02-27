# Corno Release Checklist

## Build + Packaging
- `npm ci`
- `npm run check`
- `npm run ios:sync`
- Confirm app name shows as `Corno` in:
  - browser title
  - web manifest install prompt
  - iOS app display name

## Functional QA
- Home: tap anywhere advances to Mic.
- Mic: permission prompt works for allow/deny paths.
- Tuner: menu opens from top-left hamburger and closes correctly.
- Tuner: stable note hold does not jump erratically.
- Tuner: auto string recognition follows E2/A2/D3/G3/B3/E4 without manual selection.
- Layout mode (`auto/desktop/ios`) changes shell shape correctly.

## Device QA
- iPhone Safari:
  - microphone permission flow
  - sustained note stability
  - orientation and safe-area behavior
- Desktop Chrome + Safari:
  - full-screen desktop layout
  - mic input selector + refresh
  - performance under continuous tuning

## Privacy + Policy
- Privacy copy matches real behavior:
  - local processing
  - no raw audio storage
  - permission revocation instructions

## Store/Publishing Prep
- Final app icon and splash assets exported at required sizes.
- Version is set to `1.0.0`.
- Changelog/release notes drafted.
- Final smoke test from clean install completed.

