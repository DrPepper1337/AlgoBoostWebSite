import React, { useEffect, useState } from 'react';

const VerifyPage = () => {
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    // Parse token from URL query string
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    console.log("VerifyPage mounted with token:", token);

    if (!token) {
      setMessage("Verification token missing");
      return;
    }

    fetch(`http://localhost:8080/api/verify?token=${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.warn("Verification error response:", text);
          throw new Error(text || "Verification failed");
        }
        return res.json();
      })
      .then((data) => {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("verified", Date.now().toString());
        setMessage("Success! You can close this tab.");
      })
      .catch((error) => {
        console.error('Verification error:', error);
        if (localStorage.getItem("authToken")) {
          setMessage("Verification already done. You can close this tab.");
        } else {
          setMessage("Verification failed. Please try again.");
        }
      });
  }, []);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyPage;