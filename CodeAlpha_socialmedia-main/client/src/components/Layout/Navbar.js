// client/src/components/Layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css'; // Assuming styling is in App.css for now

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Social App</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated ? (
          <>
            <li><Link to="/create-post">Create Post</Link></li>
            <li><Link to={`/profile/${user.id}`}>Profile</Link></li>
            <li><button onClick={handleLogoutClick}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;