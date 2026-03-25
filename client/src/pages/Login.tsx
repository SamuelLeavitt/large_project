import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface LoginProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

const Login = ({ setIsLoggedIn }: LoginProps) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        setIsLoggedIn(true);
        navigate('/');
    }

    const handleRegister = () => {
        navigate('/register');
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Login</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Username
                </label>
                <input
                    id="username"
                    type="text"
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

            <div style={{ marginBottom: '30px' }}>
                <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Password
                </label>
                <input
                    id="password"
                    type="password"
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

            <div style={{ marginBottom: '20px' }}>
                <Button label="Login" variant="primary" onClick={handleLogin} />
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