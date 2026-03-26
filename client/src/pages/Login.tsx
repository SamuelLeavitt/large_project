import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

interface LoginProps {
    setIsLoggedIn: (loggedIn: boolean) => void;
}

// New Login page component
const Login = ({ setIsLoggedIn }: LoginProps) => {

    const navigate = useNavigate();

    const handleLogin = () => {
        setIsLoggedIn(true); // Update the login state in the App component to true.
        navigate('/'); // Redirect to the Home page after logging in.
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1>Login Page</h1>
            <p> Please log in to your account.</p>

            {/* Dummy Login Button to redirect to Home page */}
            <Button label="Log In" variant="primary" onClick={handleLogin} />
        </div>
    );
};

// Makes the file publicly available for the main App component to import and use
export default Login;