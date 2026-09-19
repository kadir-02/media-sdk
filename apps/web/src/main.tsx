import React from "react";
import ReactDOM from "react-dom/client";
import { MediaProvider } from "media-react";
import { App } from "./App.js";
import "./styles.css";

const apiKey = import.meta.env.VITE_PEXELS_API_KEY as string | undefined;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {apiKey ? (
      <MediaProvider apiKey={apiKey}>
        <App />
      </MediaProvider>
    ) : (
      <MissingApiKey />
    )}
  </React.StrictMode>
);

function MissingApiKey() {
  return (
    <div className="app-shell">
      <div className="empty-state">
        <h1>Missing Pexels API key</h1>
        <p>
          Get a free key at{" "}
          <a href="https://www.pexels.com/api/" target="_blank" rel="noreferrer">
            pexels.com/api
          </a>
          .
        </p>
      </div>
    </div>
  );
}
