import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { App } from "./App";
import { reportWebVitals } from "./utils/performance";

const rootElement = document.getElementById("app") as HTMLElement;
createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);

// Report performance metrics
import { onCLS, onINP, onFCP, onLCP, onTTFB } from "web-vitals";

onCLS(reportWebVitals);
onINP(reportWebVitals);
onFCP(reportWebVitals);
onLCP(reportWebVitals);
onTTFB(reportWebVitals);
