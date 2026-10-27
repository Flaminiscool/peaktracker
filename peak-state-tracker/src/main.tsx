import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { initSync } from "./lib/sync";
import "./index.css";

// Offline support: registers the service worker that caches the app.
registerSW({ immediate: true });

// Optional cloud sync (does nothing unless Supabase keys are set).
initSync();

createRoot(document.getElementById("root")!).render(<App />);
