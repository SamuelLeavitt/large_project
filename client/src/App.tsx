// Import React and useState for state management.
import { useState } from 'react';

// Import Routing tools from react-router-dom to handle page navigation.
import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

// Import pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Import Navbar
import Navbar from './components/Navbar';


function App(){

  // Create a state variable to track if the user is logged in or not. Initially set to false.
  // isLoggedIn is the boolean variable.
  // setIsLoggedIn is the function to update the isLoggedIn state.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>

      {/* Pass the login status to the Navbar: If false show login/register links, else show workout app relevant links */}
      <Navbar isLoggedIn={isLoggedIn}/> {/* Includes the Navbar components to all pages. */}

        {/* Define the routes to the various pages for this workout app */}
      <Routes>
        {/* If isLoggedIn = true, show Home page. If isLoggedIn = false, redirect to Login page */}
        <Route path = "/" element={isLoggedIn ? <Home /> : <Navigate to='/login' />} />

        {/* Pass the function setIsLoggedIn to the login page. Once logged in, update the isLoggedIn state */}
        <Route path = "/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

        <Route path = "/register" element={<Register />} />

        <Route path = "/profile" element={isLoggedIn ? <Profile /> : <Navigate to='/login' />} />
      </Routes>

    </Router>
  );
}

export default App;