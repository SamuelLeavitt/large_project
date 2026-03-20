import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";


interface NavbarProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
}


const Navbar = ({ isLoggedIn, setIsLoggedIn }: NavbarProps) => {
    const navigate = useNavigate(); // Initializes the useNavigate hook to navigate between routes.

    const handleLogout = () => {
        setIsLoggedIn(false); // Changes the login state to false.
        navigate("/login"); // Redirects to the login page after logging out.
    };

    return (
        <nav style={{
            display: 'flex',              // Use Flexbox: 
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'var(--social-bg)', // MATCHES INDEX.CSS: Swaps colors in Dark Mode
            borderBottom: '1px solid var(--border)', // MATCHES INDEX.CSS: Swaps colors in Dark Mode
            color: 'var(--text-h)',       // MATCHES INDEX.CSS: Swaps colors in Dark Mode
            backdropFilter: 'blur(5px)',   // A nice modern "glass" effect
            position: 'sticky',              // Keeps the navbar at the top of the viewport when scrolling
            top: 0,
            zIndex: 1000,                   // Ensures the navbar stays above other content
        }}>

            <strong>Workout App</strong>

            <div style={{
                display: 'flex',       // Align children horizontally
                alignItems: 'center',  // Center them vertically
                gap: '12px'
            }}>
                {/* If isLoggedIn = true, show profile and logout links */}
                {/* If isLoggedIn = false, show login and register links */}
                {isLoggedIn ? (
                    <>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Button label="Home" variant="secondary" onClick={() => { }} />
                        </Link>

                        <Link to="/profile" style={{ textDecoration: 'none' }}>
                            <Button label="Profile" variant="secondary" onClick={() => { }} />
                        </Link>

                        <Button label="Logout" variant="danger" onClick={handleLogout} />
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Button label="Login" variant="secondary" onClick={() => { }} />
                        </Link>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Button label="Register" variant="secondary" onClick={() => { }} />
                        </Link>
                    </>
                )}

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
                    <ThemeToggle />
                </div>

            </div>
        </nav>
    );
};

export default Navbar;