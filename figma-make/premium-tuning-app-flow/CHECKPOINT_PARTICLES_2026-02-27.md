# Checkpoint: Tuner-Style Particles Across Home/Mic

Date: 2026-02-27

## Snapshot Intent
- Side-bar Möbius strip exploration for later.
- Keep Home and Mic on the same particle style used by Tuner to avoid visual/debug overhead.

## Active Particle Config (Home + Mic)
- `formation`: `cloud`
- `particleCount`: `520`
- `sizeScale`: `2.9`
- `formationStrength`: `0.4`
- `spreadMultiplier`: `1.7`

## Files Updated For This Checkpoint
- `src/app/screens/SplashScreen.tsx`
- `src/app/screens/MicPermissionScreen.tsx`

## Resume Möbius Later
- Re-enable by switching `formation` back to `mobius` in Home/Mic and retuning `formationStrength`/`spreadMultiplier`.
