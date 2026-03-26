import { useState, useEffect } from "react";
import Button from "./Button";

const ThemeToggle = () => {

    // State to track whether dark mode is enabled or not.
    // isDarkMode is a boolean that is initially set to false (light mode).
    // setIsDarkMode is a function that can be used to update the isDarkMode state.
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Updates the <body> class based on the isDarkMode state.
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }, [isDarkMode]);
    
    return (
        <Button
            label={isDarkMode ? "Light Mode" : "Dark Mode"}
            variant="secondary"
            onClick={() => setIsDarkMode(!isDarkMode)}
        />
    );
};

export default ThemeToggle;