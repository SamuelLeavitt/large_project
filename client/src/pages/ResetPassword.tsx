import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/Button";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Both password fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || "Password reset failed.");
        return;
      }

      setMessage(data?.message || "Password reset successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Network error while resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "420px", margin: "100px auto", padding: "40px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Reset Password</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="new-password" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
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

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="confirm-new-password" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
            Confirm New Password
          </label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
          <Button label={loading ? "Saving..." : "Reset Password"} variant="primary" onClick={() => {}} disabled={loading || !token} fullWidth type="submit" />
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

export default ResetPassword;