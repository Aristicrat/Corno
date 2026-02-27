interface CentsNeedleProps {
  cents: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function CentsNeedle({ cents }: CentsNeedleProps) {
  const clamped = clamp(cents, -50, 50);
  const percent = ((clamped + 50) / 100) * 100;
  const inTune = Math.abs(cents) <= 3;

  return (
    <div className="w-full">
      <div className="relative h-12">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 rounded-full bg-white/25" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-16 rounded-full bg-emerald-300/80" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-white/70">-50</div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-white/70">+50</div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white/70">0</div>
        <div
          className="absolute top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full"
          style={{
            left: `${percent}%`,
            transform: "translate(-50%, -50%)",
            background: inTune ? "rgb(74,217,104)" : "rgb(255,255,255)",
            boxShadow: inTune ? "0 0 14px rgba(74,217,104,0.9)" : "0 0 12px rgba(255,255,255,0.75)",
          }}
        />
      </div>
    </div>
  );
}
