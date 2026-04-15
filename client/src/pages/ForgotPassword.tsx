import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Request failed.");
        return;
      }

      setMessage(data?.message || "If that email exists, a reset link has been sent.");
    } catch {
      setError("Network error while requesting reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "100px auto", padding: "40px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px", lineHeight: '1.2' }}>Forgot Password</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="forgot-email" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Email
          </label>
          <input
            id="forgot-email"
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

        {error && <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>}
        {message && <div style={{ color: "green", marginBottom: "12px" }}>{message}</div>}

        <div style={{ marginBottom: "20px" }}>
          <Button label={loading ? "Sending..." : "Send Reset Link"} variant="primary" onClick={() => {}} disabled={loading} fullWidth type="submit" />
        </div>
      </form>

      <div style={{ textAlign: "center" }}>
        <Link to="/login" style={{ color: "#007bff", textDecoration: "none", fontWeight: 500 }}>
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;