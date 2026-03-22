interface WorkoutCardProps {
    workoutLabel: string;      // name of the workout.
    workoutImage: string;      // link to the workout image/thumbnail
    workoutDuration: string;    // duration of the workout (e.g., "30 mins").
    workoutLink: string;    // link to the workout card page.
}

const WorkoutCard = ({ workoutLabel, workoutImage, workoutDuration, workoutLink }: WorkoutCardProps) => {
    return (
        // Each workout card is a clickable link that navigates to the workout details page via workoutLink.
        <a href={workoutLink} style={{
            flex: '0 0 250px', // Fixed width for each card
            height: '300px',
            backgroundColor: 'var(--social-bg)', // MATCHES INDEX.CSS: Swaps colors in Dark Mode
            borderRadius: '16px',
            border: '1px solid var(--border)', // MATCHES INDEX.CSS: Swaps colors in Dark Mode
            textDecoration: 'none',
            overflow: 'hidden', // Ensures content doesn't overflow the card
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s' // Smooth hover effect 
        }}
            // Add hover effect to the workout card.
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)'; // Slight lift on hover
            }}
            // Reset the workout card when the mouse leaves.
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'; // Reset position when not hovering
            }}>
            {/* Styling options for the workout image */}
            <div style={{
                height: '60%',
                background: `url(${workoutImage}) center/cover no-repeat`,
                backgroundColor: 'var(--code-bg)'
            }} />

            {/* Styling for the content Section: workout title & duration */}
            <div style={{
                padding: '15px',
                textAlign: 'left'
            }}>

                <h3 style={{
                    margin: '0 0 5px 0',
                    color: 'var(--text-h)',
                    fontSize: '1.1rem'
                }}>
                    {workoutLabel}
                </h3>

                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text)'
                }}>
                    ⏱ {workoutDuration}
                </p>

            </div>
        </a>
    );
};

export default WorkoutCard;