import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    // query: Holds the current text that was typed into the search bar.
    // SetQuery: The function that updates "query" when the user types something.
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false); // Tracks if the user is focused on the search bar.
    const navigate = useNavigate(); // Initializes the useNavigate hook to navigate between routes.

    return (
        // Search Bar Container.
        <div style={{ position: 'relative', width: '300px' }}>

            <input
                type="text"
                placeholder="Search exercises..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setTimeout(() => setIsFocused(false), 200);
                }}
                style={{
                    width: '100%',
                    padding: '10px 15px 10px 40px',
                    borderRadius: '20px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--social-bg)',
                    color: 'var(--text-h)',
                    outline: 'none',
                    fontSize: '0.9rem',
                    transition: 'border-color 0.3s ease'
                }}
            />

            {/* Search Icon */}
            <span style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: 0.5
            }}>🔍</span>


            {/* Quick Results Dropdown (Only shows if typing) */}
            {isFocused && (
                <div style={{
                    position: 'absolute',
                    top: '45px',
                    width: '100%',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow)',
                    zIndex: 2000,
                    overflow: 'hidden'
                }}>
                    {query.length == 0 ? (
                        <div
                            onClick={() => navigate('/WorkoutSearchByCategory')}
                            style={{
                                padding: '12px', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px',
                                color: 'var(--accent)',
                                fontWeight: '400',
                                backgroundColor: 'var(--accent-bg)'
                            }}
                        >
                            <span>📂</span> Browse Exercises by Category
                        </div>
                    ) : (
                        <div style={{ padding: '10px', fontSize: '0.8rem', color: 'var(--text)' }}>
                            Searching for "{query}"...
                        </div>
                    )}

                    {/* TODO: Implement actual search results */}
                </div>
            )}
        </div>
    );
};

export default SearchBar;