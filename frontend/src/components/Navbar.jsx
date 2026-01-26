import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, MessageCircle, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h2>Synapso</h2>
      </div>
      <div className="nav-links">
        <NavLink to="/swipe" className="nav-link">
          <Home size={20} />
          <span>Discover</span>
        </NavLink>
        <NavLink to="/matches" className="nav-link">
          <Users size={20} />
          <span>Matches</span>
        </NavLink>
        <NavLink to="/profile" className="nav-link">
          <User size={20} />
          <span>Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="nav-link logout-btn">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
