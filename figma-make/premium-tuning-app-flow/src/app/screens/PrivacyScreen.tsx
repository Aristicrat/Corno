import { useNavigate } from "react-router";
import { GlassSurface } from "../components/GlassSurface";
import { IPhoneFrame } from "../components/iPhoneFrame";

export function PrivacyScreen() {
  const navigate = useNavigate();

  return (
    <IPhoneFrame>
      <div className="h-full overflow-auto p-6 text-white" style={{ background: "rgb(28,28,30)" }}>
        <div className="mx-auto max-w-2xl space-y-4">
          <button onClick={() => navigate(-1)} className="text-sm text-white/80 underline">
            Back
          </button>

          <GlassSurface className="rounded-3xl p-6 space-y-4">
            <h1 className="text-3xl font-semibold">Privacy Policy</h1>
            <p className="text-sm text-white/85">
              Corno uses your microphone only to detect pitch in real time. Audio is processed on-device in your browser.
            </p>
            <p className="text-sm text-white/85">
              We do not store raw microphone audio. If telemetry is enabled by configuration, only app diagnostics and anonymous
              usage events are sent.
            </p>
            <p className="text-sm text-white/85">
              You can revoke microphone access at any time in your browser site permissions.
            </p>
            <p className="text-xs text-white/70">Effective date: February 27, 2026</p>
          </GlassSurface>
        </div>
      </div>
    </IPhoneFrame>
  );
}
