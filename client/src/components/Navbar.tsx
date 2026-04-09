import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import SearchBar from "./SearchBar";


interface NavbarProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
}


const Navbar = ({ isLoggedIn, setIsLoggedIn }: NavbarProps) => {
    const navigate = useNavigate(); // Initializes the useNavigate hook to navigate between routes.

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false); // Changes the login state to false.
        navigate("/login"); // Redirects to the login page after logging out.
    };

    return (
        // Navbar Container styling.
        <nav style={{
            display: 'flex',              // Use Flexbox: Align children horizontally and space them out.
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

            {/*Left side of Navbar: Title*/}
            <strong style={{
                fontSize: '1.2rem',
                minWidth: 'fit-content'
            }}>💪 Workout App</strong>

            {/*Center of Navbar: Search Bar (Only shows if logged in)*/}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 20px',
                minWidth: 0,
                overflow: 'hidden'
            }}>
                {isLoggedIn && (
                    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center'   }}>
                        <SearchBar />
                    </div>
                )}
            </div>

            {/*Right side of Navbar: 
                isLoggedIn = False, shows Login/Register/ThemeToggle
                isLoggedIn = True, shows Profile/Workout/Logout/ThemeToggle*/}
            <div style={{
                display: 'flex',       // Align children horizontally
                alignItems: 'center',  // Center them vertically
                gap: '12px',
                flexShrink: 0,        // Prevents the right side from shrinking when space is tight
                whiteSpace: 'nowrap',    // Prevents the buttons from wrapping to the next line
                minWidth: 'fit-content'     // Ensures the container only takes up as much space as needed
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

                        <Link to="/workout" style={{ textDecoration: 'none' }}>
                            <Button label="Workout" variant="secondary" onClick={() => { }} />
                        </Link>
                        <Link to="/workout-history" style={{ textDecoration: 'none' }}>
                            <Button label="History" variant="secondary" onClick={() => { }} />
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