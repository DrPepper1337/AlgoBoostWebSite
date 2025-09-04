import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const VerifyPage = () => {
  const [message, setMessage] = useState("Verifying...");
  const location = useLocation();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Verification token missing");
      return;
    }

    const lastVerifiedToken = localStorage.getItem("verifiedToken");
    if (lastVerifiedToken === token) {
      setMessage("Verification already completed. You can close this tab.");
      return;
    }

    fetch(`http://localhost:8080/api/verify?token=${token}`)
      .then(async (res) => {
        const json = await res.json();
        console.log("Verification response:", res.status, json);

        if (!res.ok || !json.success) {
          throw new Error(json.message || "Verification failed");
        }

        if (json.data?.token) {
          localStorage.setItem("authToken", json.data.token);
          localStorage.setItem("verified", Date.now().toString());
        } else {
          localStorage.setItem("passwordResetSuccess", Date.now().toString());
        }

        localStorage.setItem("verifiedToken", token);
        setMessage(json.message || "Success! You can close this tab.");
      })
      .catch((err) => {
        console.error("Verification error:", err);

        if (localStorage.getItem("verifiedToken") === token) {
          setMessage("Verification already completed. You can close this tab.");
        } else {
          setMessage(`Verification failed: ${err.message || "Try again."}`);
        }
      });
  }, [location.search]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h3>{message}</h3>
    </div>
  );
};

export default VerifyPage;
