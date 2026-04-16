import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface LocationState {
  email?: string;
}

const EmailConfirmation = () => {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState(state?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    "We found an unverified account. Enter your email to resend the verification link."
  );

  const handleResendVerification = async () => {
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Unable to resend verification email.");
        return;
      }

      setMessage(data?.message || "Verification email sent.");
    } catch {
      setError("Network error while resending verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "520px", margin: "100px auto", padding: "40px" }}>
      <h1 style={{ textAlign: "center" }}>Confirm Email</h1>
      <p style={{ textAlign: "center", color: "#555", marginBottom: "24px" }}>
        You need to verify your account before logging in.
      </p>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && <p style={{ color: "red", marginBottom: "14px" }}>{error}</p>}
      {message && <p style={{ color: "green", marginBottom: "14px" }}>{message}</p>}

      <button
        type="button"
        onClick={handleResendVerification}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "4px",
          backgroundColor: loading ? "#6fa8df" : "#007bff",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 600,
        }}
      >
        {loading ? "Sending..." : "Resend verification email"}
      </button>

      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default EmailConfirmation;
