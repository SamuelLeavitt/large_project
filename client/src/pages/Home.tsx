import ScrollRow from "../components/ScrollRow";
import WorkoutCard from "../components/WorkoutCard";

// This list is to be DELETED once we can pull data from the workout API. This is for testing purposes only.
const recentWorkouts = [
    { id: 1, label: "Yoga", image: "https://picsum.photos/seed/yoga/300/200", duration: "20 min", link: "/workout/1" },
    { id: 2, label: "Bench Press", image: "https://picsum.photos/seed/Chest/300/200", duration: "45 min", link: "/workout/2" },
    { id: 3, label: "Jog", image: "https://picsum.photos/seed/Jogging/300/200", duration: "30 min", link: "/workout/3" },
    { id: 4, label: "Planks", image: "https://picsum.photos/seed/planks/300/200", duration: "15 min", link: "/workout/4" },
    { id: 5, label: "Swimming Laps", image: "https://picsum.photos/seed/swim/300/200", duration: "40 min", link: "/workout/5" },
    { id: 6, label: "Cycling", image: "https://picsum.photos/seed/Cycling/300/200", duration: "60 min", link: "/workout/6" },
    { id: 7, label: "Bicep Curls", image: "https://picsum.photos/seed/Curls/300/200", duration: "25 min", link: "/workout/7" },
    { id: 8, label: "Squats", image: "https://picsum.photos/seed/squats/300/200", duration: "10 min", link: "/workout/8" },
    { id: 9, label: "Deadlifts", image: "https://picsum.photos/seed/power/300/200", duration: "60 min", link: "/workout/9" },
    { id: 10, label: "Elliptical", image: "https://picsum.photos/seed/elliptical/300/200", duration: "30 min", link: "/workout/10" },
];

// This list is to be DELETED once we can save multiple workout plans. This is for testing purposes only.
const workoutPlans = [
    { id: 1, label: "New Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "60 minutes", link: "/workout/1" },
    { id: 2, label: "Old Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "45 min", link: "/workout/2" },
    { id: 3, label: "Workout Plan 3", image: "https://picsum.photos/seed/workout/300/200", duration: "30 min", link: "/workout/3" },
    { id: 4, label: "Group Workout", image: "https://picsum.photos/seed/workout/300/200", duration: "2 hrs", link: "/workout/4" },
    { id: 5, label: "When Frank tags along", image: "https://picsum.photos/seed/workout/300/200", duration: "1 hr", link: "/workout/5" },
    { id: 6, label: "Summer Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "60 min", link: "/workout/6" },
    { id: 7, label: "Winter Workout Plan", image: "https://picsum.photos/seed/workout/300/200", duration: "25 min", link: "/workout/7" },
    { id: 8, label: "One Punch Man", image: "https://picsum.photos/seed/workout/300/200", duration: "100 min", link: "/workout/8" },
    { id: 9, label: "Rocky Balboa Workout", image: "https://picsum.photos/seed/workout/300/200", duration: "60 min", link: "/workout/9" },
    { id: 10, label: "Idk", image: "https://picsum.photos/seed/workout/300/200", duration: "Infinity", link: "/workout/10" },
];


// New Home page component
const Home = () => {
    return (
        <main style={{ width: '100%', paddingTop: '20px' }}>
            
            {/* The Row Component */}
            <ScrollRow title="Recent Workouts">
                
                {/* We "Map" through the array to turn data into UI */}
                {recentWorkouts.map((workout) => (
                    <WorkoutCard
                        key={workout.id} // React needs a unique key for list items
                        workoutLabel={workout.label}
                        workoutImage={workout.image}
                        workoutDuration={workout.duration}
                        workoutLink={workout.link}
                    />
                ))}

            </ScrollRow>
            


            <ScrollRow title="My Workout Plans">
                
                {/* We "Map" through the array to turn data into UI */}
                {workoutPlans.map((plan) => (
                    <WorkoutCard
                        key={plan.id} // React needs a unique key for list items
                        workoutLabel={plan.label}
                        workoutImage={plan.image}
                        workoutDuration={plan.duration}
                        workoutLink={plan.link}
                    />
                ))}

            </ScrollRow>





           

        </main>
    );
};

// Makes the file publicly available for the main App component to import and use
export default Home;