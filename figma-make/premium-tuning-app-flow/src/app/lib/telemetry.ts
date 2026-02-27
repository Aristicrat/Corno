type TelemetryPayload = Record<string, unknown>;

const TELEMETRY_ENDPOINT = import.meta.env.VITE_TELEMETRY_ENDPOINT as string | undefined;

function postTelemetry(event: string, payload: TelemetryPayload = {}) {
  if (!TELEMETRY_ENDPOINT) return;
  const body = JSON.stringify({
    event,
    ts: Date.now(),
    path: typeof window !== "undefined" ? window.location.pathname : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    ...payload,
  });

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon(TELEMETRY_ENDPOINT, body);
    return;
  }

  fetch(TELEMETRY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackEvent(event: string, payload?: TelemetryPayload) {
  postTelemetry(event, payload);
}

export function initTelemetry() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (event) => {
    postTelemetry("window_error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      typeof event.reason === "string"
        ? event.reason
        : event.reason?.message || "unknown rejection";
    postTelemetry("unhandled_rejection", { reason });
  });
}
