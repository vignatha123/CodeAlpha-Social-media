// client/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Removed Link, useNavigate
// import axios from 'axios'; // Removed axios, as it's not directly used here
import './App.css';

// Components
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Home from './components/Home';
import Profile from './components/Profile/Profile';
import PostDetail from './components/Post/PostDetail';
import CreatePost from './components/Post/CreatePost';
import Navbar from './components/Layout/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for token in localStorage on app load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setUser(storedUser);
    }
  }, []);

  const handleAuthSuccess = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <div className="container">
          <Routes>
            <Route path="/register" element={<Register onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/login" element={<Login onAuthSuccess={handleAuthSuccess} />} />
            <Route path="/" element={<Home isAuthenticated={isAuthenticated} user={user} />} />
            <Route path="/profile/:userId" element={<Profile isAuthenticated={isAuthenticated} currentUser={user} />} />
            <Route path="/post/:postId" element={<PostDetail isAuthenticated={isAuthenticated} currentUser={user} />} />
            <Route path="/create-post" element={isAuthenticated ? <CreatePost currentUser={user} /> : <Login onAuthSuccess={handleAuthSuccess} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;