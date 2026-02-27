import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackEvent } from "../lib/telemetry";

export function TelemetryTracker() {
  const location = useLocation();

  useEffect(() => {
    trackEvent("page_view", {
      path: location.pathname,
    });
  }, [location.pathname]);

  return null;
}
