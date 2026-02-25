import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import "./index.css";
import AuthProvider from "./contexts/AuthContext.jsx";
import App from "./App.jsx";
import PrivacyPolicy from "./PrivacyPolicy.jsx";

const isPrivacy = window.location.pathname === "/privacy";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {isPrivacy ? (
      <PrivacyPolicy />
    ) : (
      <AuthProvider>
        <App />
        <Analytics />
      </AuthProvider>
    )}
  </StrictMode>
);
