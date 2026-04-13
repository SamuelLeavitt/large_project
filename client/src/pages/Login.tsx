import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface LoginProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setError(null);
        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        // Clear any existing auth before attempting a new login.
        localStorage.removeItem("token");
        setIsLoggedIn(false);

        setLoading(true);
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);

                const message = data?.error || data?.message || "Login failed";
                if (res.status === 403) {
                    navigate('/email-confirmation', { state: { email } });
                    setLoading(false);
                    return;
                }

                setError(message);
                setLoading(false);
                return;
            }

            if (data.token) localStorage.setItem("token", data.token);
            setIsLoggedIn(true);
            navigate('/');
        } catch {
            setError("Network error during login.");
        } finally {
            setLoading(false);
        }
    }

    const handleRegister = () => {
        navigate('/register');
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h1>
            
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

            <div style={{ marginBottom: '30px' }}>
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

            {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}
            <div style={{ marginBottom: '20px' }}>
                <Button label={loading ? "Logging in..." : "Login"} variant="primary" onClick={handleLogin} disabled={loading} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#007bff',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}
                >
                    Forgot password?
                </button>
            </div>

            <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0', color: '#666' }}>
                    Don't have an account?{' '}
                    <a 
                        onClick={handleRegister}
                        style={{ 
                            cursor: 'pointer', 
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Register here
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
