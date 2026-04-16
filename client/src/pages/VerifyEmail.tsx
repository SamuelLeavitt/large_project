import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token") || "";

    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setStatus("error");
          setMessage(data?.error || data?.message || "Verification failed.");
          return;
        }

        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      } catch {
        setStatus("error");
        setMessage("Network error during verification.");
      }
    };

    void verify();
  }, [searchParams]);

  return (
    <div style={{ maxWidth: "520px", margin: "100px auto", padding: "40px" }}>
      <h1 style={{ textAlign: "center" }}>Verify Email</h1>
      <p style={{ textAlign: "center", color: status === "error" ? "red" : "inherit" }}>{message}</p>
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;