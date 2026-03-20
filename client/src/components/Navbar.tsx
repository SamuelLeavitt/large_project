import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
    return (
        <nav style={{
            padding: '10px',
            background: '#333',
            color: '#fff'
        }}>

            <strong>Workout App</strong>

            <div style={{ float: 'right' }}>
                {/* If isLoggedIn = true, show profile and logout links */}
                {/* If isLoggedIn = false, show login and register links */}
                {isLoggedIn ? (
                    <>
                        <Link to="/" style={{ color: 'white', marginRight: '10px' }}>Home</Link>
                        <Link to="/profile" style={{ color: 'white', marginRight: '10px' }}>Profile</Link>
                        <button onClick={() => window.location.reload()}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: 'white', marginRight: '10px' }}>Login</Link>
                        <Link to="/register" style={{ color: 'white' }}>Register</Link>
                    </>
                )
                }
            </div>
        </nav>
    );
};

export default Navbar;