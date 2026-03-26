import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Register = () => {
    const navigate = useNavigate();

    const handleRegister = () => {
        // TODO: Handle registration logic
    }

    const handleBackToLogin = () => {
        navigate('/login');
    }

    return (
        <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Create Account</h1>
            
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

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Email
                </label>
                <input
                    id="email"
                    type="email"
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

            <div style={{ marginBottom: '20px' }}>
                <Button label="Register" variant="primary" onClick={handleRegister} />
            </div>

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