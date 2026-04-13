import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        if (loading) return;
        setError(null);
        if (!username || !email || !password) {
            setError("All fields are required.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const msg = (data as any)?.error || (data as any)?.message || "Registration failed";
                setError(msg);
                setLoading(false);
                return;
            }

            navigate('/email-confirmation', { state: { email } });
        } catch {
            setError("Network error during registration.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', lineHeight: '1.2' }}>Create Account</h1>
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
                <div style={{ marginBottom: '20px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            border: '1px solid var(--accent-border)',
                            borderRadius: '8px',
                            backgroundColor: 'var(--accent)',
                            color: 'var(--bg)',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </div>
            </form>

            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0', color: '#666' }}>
                    Already have an account?{' '}
                    <a 
                        onClick={handleBackToLogin}
                        style={{ 
                            cursor: 'pointer', 
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Register;
