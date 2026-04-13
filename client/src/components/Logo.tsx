import { Link } from "react-router-dom";

const Logo = () => {
    return (
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
            }}>
                <span style={{
                    fontSize: '1.4rem',
                    fontWeight: '800',
                    letterSpacing: '-0.5px',
                    color: 'var(--text-h)',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', sans-serif"
                }}>
                    Workout
                    <span style={{ color: 'var(--accent-color, var(--accent))' }}>
                        Planner
                    </span>
                </span>
            </div>
        </Link>
    );
};

export default Logo;