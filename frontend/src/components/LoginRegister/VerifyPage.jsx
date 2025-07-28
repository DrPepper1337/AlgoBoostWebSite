import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyPage = () => {
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("Verification token missing");
      return;
    }

    fetch(`http://localhost:8080/api/verify?token=${token}`, {
      method: "GET",
    })
      .then(async (res) => {
        const text = await res.text();

        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error("Invalid JSON response");
        }

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Verification failed");
        }

        if (!data.data?.token) {
          throw new Error("JWT token missing in response");
        }

        // Save JWT token and mark as verified
        localStorage.setItem("authToken", data.data.token);
        localStorage.setItem("verified", Date.now().toString());

        setMessage("Verification successful! You can close this tab.");
      })
      .catch((error) => {
  console.error("Verification error:", error);

  if (localStorage.getItem("verified")) {
    setMessage("Verification already completed. You can close this tab.");
  } else {
    localStorage.removeItem("authToken");
    localStorage.removeItem("verified");
    setMessage(`Verification failed: ${error.message || "Try again."}`);
  }
});
  }, [navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyPage;
