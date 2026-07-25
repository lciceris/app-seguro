import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";

function App() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-500">App Seguro — bootstrap em andamento.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
