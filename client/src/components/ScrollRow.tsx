import React, { useRef, useState, useEffect } from 'react';

interface ScrollRowProps {
    title: string;      // The title of the scroll row (e.g., "Recent Workouts, "Workout Planners", etc.)     
    children: React.ReactNode; // This allows us to put Cards inside the Row
}


// Thus components takes in a title and children (the workout cards) and renders a horizontally scrollable row of workout cards with a title above it.
const ScrollRow = ({ title, children }: ScrollRowProps) => {

    const scrollRef = useRef<HTMLDivElement>(null); // Ref to the scroll container
    const [isHovered, setIsHovered] = useState(false); // State to track hover status

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // The "Real" function that stops the vertical scroll
        const handleWheelManual = (e: WheelEvent) => {
            if (Math.abs(e.deltaY) > 0) {
                e.preventDefault(); // This will now work!
                el.scrollLeft += e.deltaY;
            }
        };

        // Adding the listener with passive: false
        el.addEventListener('wheel', handleWheelManual, { passive: false });

        // Clean up when the component is destroyed
        return () => el.removeEventListener('wheel', handleWheelManual);
    }, []);


    

    return (
        // Scroll Row Container
        <section
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}

            style={{
                marginTop: '10px',
                marginBottom: '50px',
                textAlign: 'left',
                transition: 'background-color 0.3s ease',
                // Subtle highlight when mouse is inside the block
                backgroundColor: isHovered ? 'var(--accent-bg)' : 'transparent',
                borderRadius: '16px',
                paddingTop: '10px'
            }}>

            {/* The Subheader ("Recent Workouts, "Workout Planners", etc.) */}
            <h2 style={{
                marginLeft: '24px',
                color: 'var(--text-h)',
                fontSize: '1.5rem',
                transition: 'all 0.3s ease'
            }}>
                {title}
            </h2>

            {/* The Scroll Container */}
            <div
                ref={scrollRef}
                className="no-scrollbar" style={{
                    display: 'flex',
                    gap: '20px',
                    overflowX: 'auto',
                    padding: '10px 24px 20px 24px', // Matches Navbar padding for alignment
                    WebkitOverflowScrolling: 'touch',
                    overscrollBehaviorX: 'contain' // Prevents scroll chaining to the parent container
                }}>
                {children}
            </div>
        </section>
    );
};

export default ScrollRow;