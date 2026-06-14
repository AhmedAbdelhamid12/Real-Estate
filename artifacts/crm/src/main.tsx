import { injectTilTheme } from "@workspace/design-tokens/web";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

injectTilTheme();

createRoot(document.getElementById("root")!).render(<App />);
