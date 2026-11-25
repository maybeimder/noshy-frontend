import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
      <StrictMode>
            <App />
      </StrictMode>,
);

// Opens without network and can be installed. Never in dev: it would serve stale modules.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
      window.addEventListener("load", () => void navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}
