import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// We've moved the AudioProvider into App.tsx
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <App />
  );
}
