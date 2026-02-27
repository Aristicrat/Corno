import { useEffect, useRef } from "react";

/**
 * TUNEFLOW LIQUID GLASS REFRACTION SYSTEM
 * 
 * Tiny floating glass squares/shards that bend and refract the background
 * like ocean caustics. Motion model:
 * - Idle: drift mostly around center as loose cloud (no defined shape)
 * - Note detected: subtle outward expansion pulse, then settles back
 * - Tuning improves: more cohesive and concentrated near center, calmer, synchronized
 * - In tune: converges toward center organically (NO ring, NO circular geometry, NO orbit)
 * 
 * HARD CONSTRAINT: Stochastic distribution always. No symmetric patterns.
 */

interface ParticleFieldProps {
  tuningState?: "listening" | "transitional" | "inTune" | "outOfTune" | "approaching";
  particleCount?: number;
  centsDeviation?: number;
  hasNote?: boolean;
  backgroundColor?: string;
  formation?: "cloud" | "lambda" | "mobius" | "smile" | "scatter";
  sizeScale?: number;
  formationStrength?: number;
  spreadMultiplier?: number;
  opacityMultiplier?: number;
  tuneHoldProgress?: number;
  morphRingToCloudOnTune?: boolean;
}

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  alpha: number;
  targetX: number;
  targetY: number;
  depth: number; // For layering (0-1, front to back)
  offsetAngle: number; // Random angle for organic positioning
  offsetRadius: number; // Random radius offset
  lambdaSegment: 0 | 1 | 2;
  lambdaT: number;
  lambdaOffset: number;
  flowSpeed: number;
  flowPhase: number;
  mobiusU: number;
  mobiusV: number;
}

export function ParticleField({
  tuningState,
  particleCount = 300,
  centsDeviation = 0,
  hasNote = false,
  backgroundColor = "rgb(0,200,179)",
  formation = "cloud",
  sizeScale = 1,
  formationStrength = 1,
  spreadMultiplier = 1,
  opacityMultiplier = 1,
  tuneHoldProgress = 0,
  morphRingToCloudOnTune = false,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);
  const introProgressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const nav = window.navigator;
    const ua = nav.userAgent || "";
    const isIOSRuntime = /iPhone|iPad|iPod/i.test(ua) || (nav.platform === "MacIntel" && nav.maxTouchPoints > 1);
    const dprCap = isIOSRuntime ? 1.5 : 2;
    const resolvedParticleCount = Math.max(120, Math.round(particleCount * (isIOSRuntime ? 0.62 : 1)));

    // Set canvas size
    const setCanvasSize = () => {
      const dpr = Math.min(dprCap, window.devicePixelRatio || 1);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      // Reset transform before scaling to avoid cumulative scale on repeated resizes.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Initialize shards if needed
    if (shardsRef.current.length !== resolvedParticleCount) {
      shardsRef.current = [];
      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2 - 40; // Slightly above center

      for (let i = 0; i < resolvedParticleCount; i++) {
        // Stochastic distribution - random angles and radii
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetRadius = (Math.random() * 60 + Math.random() * 30) * spreadMultiplier; // Varied spread
        
        const x = centerX + Math.cos(offsetAngle) * offsetRadius;
        const y = centerY + Math.sin(offsetAngle) * offsetRadius;

        shardsRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: (3 + Math.random() * 4) * sizeScale, // 3-7px varied sizes
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          alpha: 0.4 + Math.random() * 0.4, // 0.4-0.8 for depth variation
          targetX: x,
          targetY: y,
          depth: Math.random(), // 0-1 for layering
          offsetAngle,
          offsetRadius,
          lambdaSegment: Math.floor(Math.random() * 3) as 0 | 1 | 2,
          lambdaT: Math.random(),
          lambdaOffset: (Math.random() - 0.5) * 12,
          flowSpeed: 0.6 + Math.random() * 0.8,
          flowPhase: Math.random() * Math.PI * 2,
          mobiusU: Math.random() * Math.PI * 2,
          mobiusV: (Math.random() - 0.5) * 1.2,
        });
      }
    }

    // Animation loop
    const animate = () => {
      timeRef.current += 0.016; // ~60fps
      introProgressRef.current = Math.min(1, introProgressRef.current + 0.0065);
      
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const centerX = canvas.offsetWidth / 2;
      const centerY = canvas.offsetHeight / 2 - 40;

      // Determine cohesion based on state
      let cohesion = 0.5; // Default loose cloud
      let drift = 0.4;
      let attraction = 0.015;
      let spreadRadius = 80;

      const normalizedState = tuningState === "outOfTune" ? "transitional" : 
                              tuningState === "approaching" ? "transitional" : 
                              tuningState || "listening";

      if (normalizedState === "listening") {
        // Idle: loose cloud, more drift
        cohesion = 0.5;
        drift = 0.5;
        attraction = 0.012;
        spreadRadius = 90 * spreadMultiplier;
      } else if (normalizedState === "transitional") {
        // Note detected: subtle outward pulse then settle
        const pulsePhase = Math.sin(timeRef.current * 2) * 0.3 + 1;
        cohesion = 0.7;
        drift = 0.35;
        attraction = 0.018;
        spreadRadius = 70 * pulsePhase * spreadMultiplier;
      } else {
        // In tune: converges toward center, calmer, synchronized
        cohesion = 0.8;
        drift = 0.16;
        attraction = 0.02;
        spreadRadius = 120 * spreadMultiplier;
      }

      // Mobius formation should remain clearly shaped and looped in all states.
      if (formation === "mobius") {
        if (normalizedState === "listening") {
          cohesion = 0.88;
          drift = 0.12;
          attraction = 0.03;
          spreadRadius = 42 * spreadMultiplier;
        } else if (normalizedState === "transitional") {
          cohesion = 0.93;
          drift = 0.1;
          attraction = 0.036;
          spreadRadius = 38 * spreadMultiplier;
        } else {
          cohesion = 0.96;
          drift = 0.08;
          attraction = 0.042;
          spreadRadius = 34 * spreadMultiplier;
        }
      }
      if (formation === "smile") {
        cohesion = 0.97;
        drift = 0.08;
        attraction = 0.044;
        spreadRadius = 24;
      }
      if (formation === "scatter") {
        cohesion = 0.22;
        drift = 0.95;
        attraction = 0.01;
        spreadRadius = 230;
      }

      const getLambdaTarget = (shard: Shard) => {
        const scale = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.2;
        const t = shard.lambdaT;
        const jitter = shard.lambdaOffset;
        if (shard.lambdaSegment === 0) {
          return {
            x: centerX - scale * 0.52 + scale * 0.72 * t + jitter,
            y: centerY + scale * 0.62 - scale * 1.45 * t + jitter * 0.3,
          };
        }
        if (shard.lambdaSegment === 1) {
          return {
            x: centerX - scale * 0.02 + scale * 0.58 * t + jitter * 0.6,
            y: centerY - scale * 0.82 + scale * 2.05 * t + jitter * 0.2,
          };
        }
        return {
          x: centerX + scale * 0.18 + scale * 0.65 * t + jitter * 0.5,
          y: centerY + scale * 0.42 + scale * 0.02 * Math.sin(t * Math.PI),
        };
      };

      const getMobiusTarget = (shard: Shard) => {
        // Figure-eight centerline (lemniscate-like) + Mobius half-twist across strip width.
        // This produces the infinity-style shape from your reference.
        const base = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.21;
        const u = shard.mobiusU + timeRef.current * (0.2 + shard.flowSpeed * 0.03);
        const v = Math.max(-1, Math.min(1, shard.mobiusV)); // [-1, 1] across strip

        // Centerline: horizontal infinity curve.
        const cx = Math.sin(u);
        const cy = 0.42 * Math.sin(u) * Math.cos(u); // tighter vertical lobe for clearer infinity

        // Tangent and normal along centerline.
        const dx = Math.cos(u);
        const dy = 0.42 * (Math.cos(u) * Math.cos(u) - Math.sin(u) * Math.sin(u));
        const tangentLen = Math.hypot(dx, dy) || 1;
        const nx = -dy / tangentLen;
        const ny = dx / tangentLen;

        // Mobius half-twist across one full loop.
        const twist = u * 0.5;
        const stripHalf = 0.56;
        const ribbonOffset = v * stripHalf;
        const twistedNormal = ribbonOffset * Math.cos(twist);
        const pseudoDepth = ribbonOffset * Math.sin(twist) * 1.18;

        // Subtle perspective using pseudoDepth makes the cross-over read as a twisted strip.
        const perspective = 1 / (1 + pseudoDepth * 0.28);
        return {
          x: centerX + (cx + nx * twistedNormal) * base * 2.08 * perspective,
          y: centerY + (cy + ny * twistedNormal + pseudoDepth * 0.42) * base * 1.62 * perspective,
        };
      };

      const getSmileTarget = (idx: number, total: number) => {
        const scale = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.16;
        const p = (idx + 0.5) / Math.max(1, total);

        // Eyes
        if (p < 0.19) {
          const t = (p / 0.19) * Math.PI * 2;
          return {
            x: centerX - scale * 0.58 + Math.cos(t) * scale * 0.16,
            y: centerY - scale * 0.22 + Math.sin(t) * scale * 0.16,
          };
        }
        if (p < 0.38) {
          const t = ((p - 0.19) / 0.19) * Math.PI * 2;
          return {
            x: centerX + scale * 0.58 + Math.cos(t) * scale * 0.16,
            y: centerY - scale * 0.22 + Math.sin(t) * scale * 0.16,
          };
        }

        // Smile arc
        const t = (p - 0.38) / 0.62;
        const start = Math.PI * 0.15;
        const end = Math.PI * 0.85;
        const a = start + (end - start) * t;
        return {
          x: centerX + Math.cos(a) * scale * 1.08,
          y: centerY + scale * 0.02 + Math.sin(a) * scale * 0.88,
        };
      };

      const getScatterTarget = (shard: Shard) => {
        const burst = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.52;
        const swirl = timeRef.current * 0.9 + shard.flowPhase;
        return {
          x: centerX + Math.cos(shard.offsetAngle + swirl * 0.22) * burst * (0.76 + shard.depth * 0.38),
          y: centerY + Math.sin(shard.offsetAngle + swirl * 0.22) * burst * (0.54 + shard.depth * 0.34),
        };
      };

      const intro = introProgressRef.current;
      const tuneCloseness = hasNote
        ? Math.max(0, Math.min(1, 1 - Math.abs(centsDeviation) / 30))
        : 0;

      // Update shard positions
      shardsRef.current.forEach((shard, index) => {
        let targetX: number;
        let targetY: number;

        if (formation === "lambda") {
          const lambda = getLambdaTarget(shard);
          const flowPulse = 0.6 + 0.4 * Math.sin(timeRef.current * shard.flowSpeed + shard.flowPhase);
          const noiseX = Math.sin(shard.offsetAngle + timeRef.current * (0.55 + shard.flowSpeed * 0.2)) * (24 + spreadRadius * 0.24);
          const noiseY = Math.cos(shard.offsetAngle * 1.5 + timeRef.current * (0.42 + shard.flowSpeed * 0.2)) * (24 + spreadRadius * 0.24);
          const lambdaPull = Math.max(0, Math.min(1, cohesion * 0.85 * formationStrength));
          targetX = lambda.x * lambdaPull + (centerX + noiseX * flowPulse) * (1 - lambdaPull);
          targetY = lambda.y * lambdaPull + (centerY + noiseY * flowPulse) * (1 - lambdaPull);
        } else if (formation === "mobius") {
          const mobius = getMobiusTarget(shard);
          const flowPulse = 0.88 + 0.12 * Math.sin(timeRef.current * shard.flowSpeed + shard.flowPhase);
          const jitterScale = 1.15 + spreadRadius * 0.006;
          const noiseX = Math.sin(shard.offsetAngle + timeRef.current * 0.35) * jitterScale;
          const noiseY = Math.cos(shard.offsetAngle * 1.2 + timeRef.current * 0.31) * jitterScale;
          const mobiusPull = Math.max(0, Math.min(1, cohesion * formationStrength * 1.18));
          targetX = mobius.x * mobiusPull + (mobius.x + noiseX * flowPulse) * (1 - mobiusPull);
          targetY = mobius.y * mobiusPull + (mobius.y + noiseY * flowPulse) * (1 - mobiusPull);
        } else if (formation === "smile") {
          const smile = getSmileTarget(index, shardsRef.current.length);
          const pulse = 0.5 + 0.5 * Math.sin(timeRef.current * 1.8 + shard.flowPhase);
          targetX = smile.x + Math.sin(shard.offsetAngle + timeRef.current * 0.5) * (2 + pulse * 2);
          targetY = smile.y + Math.cos(shard.offsetAngle + timeRef.current * 0.5) * (2 + pulse * 2);
        } else if (formation === "scatter") {
          const scatter = getScatterTarget(shard);
          targetX = scatter.x;
          targetY = scatter.y;
        } else {
          if (morphRingToCloudOnTune) {
            // Tuner morph mode: default ring -> cloud as tuning gets closer.
            const ringTheta = shard.offsetAngle + timeRef.current * (0.05 + shard.flowSpeed * 0.02);
            const ringRadius = spreadRadius * (0.72 + shard.depth * 0.34);
            const ringBreathe = 1 + Math.sin(timeRef.current * 0.45 + shard.flowPhase) * 0.04;
            const shake = Math.min(1, Math.max(0, tuneHoldProgress));
            const wobbleAmp = 6 + shake * 10;
            const ringWobbleX = Math.sin(shard.offsetAngle * 1.8 + timeRef.current * (0.42 + shake * 1.0)) * wobbleAmp;
            const ringWobbleY = Math.cos(shard.offsetAngle * 1.55 + timeRef.current * (0.38 + shake * 0.95)) * wobbleAmp;
            const ringX = centerX + Math.cos(ringTheta) * ringRadius * ringBreathe + ringWobbleX;
            const ringY = centerY + Math.sin(ringTheta) * ringRadius * 0.62 * ringBreathe + ringWobbleY;

            const noiseX = Math.sin(shard.offsetAngle + timeRef.current * 0.3) * spreadRadius;
            const noiseY = Math.cos(shard.offsetAngle * 1.7 + timeRef.current * 0.25) * spreadRadius;
            const cloudX = centerX + noiseX * (1 - cohesion) + (Math.random() - 0.5) * 20;
            const cloudY = centerY + noiseY * (1 - cohesion) + (Math.random() - 0.5) * 20;

            targetX = ringX * (1 - tuneCloseness) + cloudX * tuneCloseness;
            targetY = ringY * (1 - tuneCloseness) + cloudY * tuneCloseness;
          } else
          // STOCHASTIC DISTRIBUTION - no circular patterns!
          // In-tune cloud should feel uniform/expansive (not collapsing to a center ball).
          if (normalizedState === "inTune") {
            const theta = shard.offsetAngle + timeRef.current * (0.045 + shard.flowSpeed * 0.022);
            const bandRadius = spreadRadius * (0.7 + shard.depth * 0.38);
            const breathe = 1 + Math.sin(timeRef.current * 0.4 + shard.flowPhase) * 0.045;
            const shake = Math.min(1, Math.max(0, tuneHoldProgress));
            const wobbleAmp = 8 + shake * 12;
            const wobbleSpeedX = 0.45 + shake * 1.1;
            const wobbleSpeedY = 0.41 + shake * 1.0;
            const wobbleX = Math.sin(shard.offsetAngle * 1.9 + timeRef.current * wobbleSpeedX) * wobbleAmp;
            const wobbleY = Math.cos(shard.offsetAngle * 1.6 + timeRef.current * wobbleSpeedY) * wobbleAmp;
            targetX = centerX + Math.cos(theta) * bandRadius * breathe + wobbleX;
            targetY = centerY + Math.sin(theta) * bandRadius * 0.6 * breathe + wobbleY;
          } else {
            // Use Perlin-like noise for organic movement
            const noiseX = Math.sin(shard.offsetAngle + timeRef.current * 0.3) * spreadRadius;
            const noiseY = Math.cos(shard.offsetAngle * 1.7 + timeRef.current * 0.25) * spreadRadius;
            targetX = centerX + noiseX * (1 - cohesion) + (Math.random() - 0.5) * 20;
            targetY = centerY + noiseY * (1 - cohesion) + (Math.random() - 0.5) * 20;
          }
        }

        // Smooth attraction to target position
        const dx = targetX - shard.x;
        const dy = targetY - shard.y;
        
        shard.vx += dx * attraction;
        shard.vy += dy * attraction;

        // Add gentle organic drift
        shard.vx += (Math.random() - 0.5) * drift * (0.35 + intro * 0.65);
        shard.vy += (Math.random() - 0.5) * drift * (0.35 + intro * 0.65);

        // Damping
        const damp = 0.94 - intro * 0.06; // starts smoother, settles to original feel
        shard.vx *= damp;
        shard.vy *= damp;

        // Update position
        shard.x += shard.vx;
        shard.y += shard.vy;

        // Keep particles inside visible bounds (important on iOS framed mode).
        const edgePad = shard.size * 0.8 + 2;
        const minX = edgePad;
        const maxX = canvas.offsetWidth - edgePad;
        const minY = edgePad;
        const maxY = canvas.offsetHeight - edgePad;

        if (shard.x < minX) {
          shard.x = minX;
          shard.vx = Math.abs(shard.vx) * 0.42;
        } else if (shard.x > maxX) {
          shard.x = maxX;
          shard.vx = -Math.abs(shard.vx) * 0.42;
        }
        if (shard.y < minY) {
          shard.y = minY;
          shard.vy = Math.abs(shard.vy) * 0.42;
        } else if (shard.y > maxY) {
          shard.y = maxY;
          shard.vy = -Math.abs(shard.vy) * 0.42;
        }

        // Update rotation
        shard.rotation += shard.rotationSpeed;

        // Draw glass shard with a dreamlike fade-in on refresh/load
        drawGlassShard(ctx, shard, backgroundColor, (0.14 + intro * 0.86) * opacityMultiplier, isIOSRuntime);
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("resize", setCanvasSize);
    };
  }, [tuningState, particleCount, centsDeviation, hasNote, backgroundColor, formation, sizeScale, formationStrength, spreadMultiplier, opacityMultiplier, tuneHoldProgress, morphRingToCloudOnTune]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}

/**
 * Draw a single glass shard with refraction effects
 * - Specular edge highlights
 * - Subtle internal reflections
 * - Refraction/distortion of background
 * - Faint caustic glints
 */
function drawGlassShard(
  ctx: CanvasRenderingContext2D,
  shard: Shard,
  backgroundColor: string,
  introAlpha = 1,
  reducedEffects = false
) {
  ctx.save();
  ctx.translate(shard.x, shard.y);
  ctx.rotate(shard.rotation);

  const size = shard.size;
  const halfSize = size / 2;

  // Layered depth: front shards sharper, back shards softer
  const blurAmount = reducedEffects ? 0.35 : shard.depth * 1.5;
  ctx.shadowBlur = blurAmount;

  // Main glass body - slightly darkened background color for refraction
  const refractionAlpha = shard.alpha * 0.3 * introAlpha;
  ctx.fillStyle = backgroundColor.replace("rgb", "rgba").replace(")", `, ${refractionAlpha})`);
  ctx.fillRect(-halfSize, -halfSize, size, size);

  // Specular edge highlights (bright rim light)
  ctx.strokeStyle = `rgba(255, 255, 255, ${shard.alpha * 0.6 * introAlpha})`;
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-halfSize, -halfSize, size, size);

  // Caustic glint (top-right corner)
  const glintGradient = ctx.createLinearGradient(-halfSize, -halfSize, halfSize, halfSize);
  glintGradient.addColorStop(0, `rgba(255, 255, 255, ${shard.alpha * 0.4 * introAlpha})`);
  glintGradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  glintGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  
  ctx.fillStyle = glintGradient;
  ctx.fillRect(-halfSize, -halfSize, size * 0.7, size * 0.7);

  // Internal reflection line (diagonal)
  ctx.strokeStyle = `rgba(255, 255, 255, ${shard.alpha * 0.25 * introAlpha})`;
  ctx.lineWidth = 0.3;
  ctx.beginPath();
  ctx.moveTo(-halfSize * 0.6, -halfSize * 0.8);
  ctx.lineTo(halfSize * 0.4, halfSize * 0.2);
  ctx.stroke();

  ctx.restore();
}
