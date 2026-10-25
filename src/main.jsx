import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";

import "./styles/index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={12}
          toastOptions={{
            duration: 3000,

            style: {
              background: "#111111",
              color: "#ffffff",
              border: "1px solid #7A0019",
              borderRadius: "16px",
              padding: "14px 18px",
              fontSize: "14px",
            },

            success: {
              style: {
                border: "1px solid #16a34a",
              },
            },

            error: {
              style: {
                border: "1px solid #dc2626",
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);