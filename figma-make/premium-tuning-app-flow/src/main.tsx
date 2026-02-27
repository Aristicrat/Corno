
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { initTelemetry } from "./app/lib/telemetry";

initTelemetry();

createRoot(document.getElementById("root")!).render(<App />);
  
