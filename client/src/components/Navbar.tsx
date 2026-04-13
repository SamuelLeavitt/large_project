import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import SearchBar from "./SearchBar";
import "../App.css"
import Logo from "./Logo";


interface NavbarProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (loggedIn: boolean) => void;
}


const Navbar = ({ isLoggedIn, setIsLoggedIn }: NavbarProps) => {
    const navigate = useNavigate(); // Initializes the useNavigate hook to navigate between routes.

    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        if (!isLoggedIn) return;

        const token = localStorage.getItem("token");

        if (!token) {
            setIsLoggedIn(false);
            return;
        }

        const parts = token.split(".");

        if (parts.length !== 3) {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            navigate("/login");
            return;
        }

        try {
            const base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
            const payload = JSON.parse(atob(`${base64Url}${padding}`));
            const expiryTime = typeof payload?.exp === "number" ? payload.exp * 1000 : 0;

            if (!expiryTime) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                navigate("/login");
                return;
            }

            const timeUntilExpiry = expiryTime - Date.now();

            if (timeUntilExpiry <= 0) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                navigate("/login");
                return;
            }

            const timeoutId = window.setTimeout(() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                navigate("/login");
            }, timeUntilExpiry);

            return () => window.clearTimeout(timeoutId);
        } catch {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            navigate("/login");
            return;
        }
    }, [isLoggedIn, navigate, setIsLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false); // Changes the login state to false.
        navigate("/login"); // Redirects to the login page after logging out.
    };

    return (<>

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
            {/*Logo component is added here */}
            <Logo />

            {/*Center of Navbar: Search Bar (Only shows if logged in)*/}
            {/* <div className="navbar__desktop-search" style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                padding: '0 20px',
                minWidth: 0,
                overflow: 'hidden'
            }}>
                {isLoggedIn && (
                    <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
                        <SearchBar />
                    </div>
                )}
            </div> */}
            

            {/*Right side of Navbar: 
                isLoggedIn = False, shows Login/Register/ThemeToggle
                isLoggedIn = True, shows Profile/Workout/Logout/ThemeToggle*/}
            <div className="navbar__desktop-links" style={{
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

                        {/* <Link to="/" style={{ textDecoration: 'none' }}>
                            <Button label="Home" variant="secondary" onClick={() => { }} />
                        </Link> */}

                        {/*Button for workout page hides itself when on the workout page */}
                        {location.pathname !== "/workout" && location.pathname !== "/" && (
                            <Link to="/workout" style={{ textDecoration: 'none' }}>
                                <Button label="Workout" variant="secondary" onClick={() => { }} />
                            </Link>
                        )}

                        {/*Button for exercise page hides itself when on the exercise page */}
                        {location.pathname !== "/exercises" && (
                            <Link to="/exercises" style={{ textDecoration: 'none' }}>
                                <Button label="Exercises" variant="secondary" onClick={() => { }} />
                            </Link>
                        )}

                        {/* <Link to="/profile" style={{ textDecoration: 'none' }}>
                            <Button label="Profile" variant="secondary" onClick={() => { }} />
                        </Link> */}

                        {/*Button for workout-history page hides itself when on the workout-history page */}
                        {location.pathname !== "/workout-history" && (
                            <Link to="/workout-history" style={{ textDecoration: 'none' }}>
                                <Button label="History" variant="secondary" onClick={() => { }} />
                            </Link>
                        )}

                        <Button label="Logout" variant="danger" onClick={handleLogout} />
                    </>
                ) : (

                    <>

                        {location.pathname !== "/login" && (
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <Button label="Login" variant="secondary" onClick={() => { }} />
                            </Link>
                        )}

                        {location.pathname !== "/register" && (
                            <Link to="/register" style={{ textDecoration: 'none' }}>
                                <Button label="Register" variant="secondary" onClick={() => { }} />
                            </Link>
                        )}
                    </>
                )}

                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
                    <ThemeToggle />
                </div>

            </div>
            {/* expandable navigation button for mobile*/}
            <button
                className={`navbar__hamburger${menuOpen ? ' open' : ''}`}
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
                <span /><span /><span />
            </button>
        </nav>
        {/* mobile drawer */}
        <div className={`navbar__drawer${menuOpen ? ' open' : ''}`}>
            <div className="navbar__drawer-inner">
                {isLoggedIn && <SearchBar />}
                {isLoggedIn ? (
                    <>
                        {/* <Link to="/">               <Button label="Home" variant="secondary" onClick={() => { }} /></Link> */}
                        {/* <Link to="/profile">        <Button label="Profile" variant="secondary" onClick={() => { }} /></Link> */}

                        {location.pathname !== "/workout" && location.pathname !== "/" && (
                            <Link to="/workout">        <Button label="Workout" variant="secondary" onClick={() => { }} /></Link>
                        )}

                        {location.pathname !== "/workout-history" && (
                            <Link to="/workout-history"><Button label="History" variant="secondary" onClick={() => { }} /></Link>
                        )}

                        {location.pathname !== "/exercises" && (
                            <Link to="/exercises">      <Button label="Exercises" variant="secondary" onClick={() => { }} /></Link>
                        )}

                        <hr className="navbar__drawer-divider" />

                        <Button label="Logout" variant="danger" onClick={handleLogout} />
                    </>
                ) : (
                    <>
                        {location.pathname !== "/login" && (
                            <Link to="/login">   <Button label="Login" variant="secondary" onClick={() => { }} /></Link>
                        )}

                        {location.pathname !== "/register" && (
                            <Link to="/register"><Button label="Register" variant="secondary" onClick={() => { }} /></Link>
                        )}
                    </>
                )}
                <hr className="navbar__drawer-divider" />
                <ThemeToggle />
            </div>
        </div>
    </>
    );
};

export default Navbar;