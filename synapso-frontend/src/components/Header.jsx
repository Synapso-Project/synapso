import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Heart, User, Search, LogOut, Clock } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
      padding: '15px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          textDecoration: 'none',
          fontSize: '1.6rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #3d302d, #886355, #b59175)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.5px'
        }}>
          Synapso
        </Link>

        <nav style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link 
            to="/swipe" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/swipe') || isActive('/') ? '#3d302d' : 'rgba(61, 48, 45, 0.7)',
              fontWeight: isActive('/swipe') || isActive('/') ? '600' : '500',
              padding: '10px 18px',
              borderRadius: '14px',
              background: isActive('/swipe') || isActive('/') 
                ? 'rgba(217, 192, 150, 0.35)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isActive('/swipe') || isActive('/') 
                ? 'rgba(217, 192, 150, 0.4)' 
                : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive('/swipe') || isActive('/') 
                ? '0 4px 15px rgba(217, 192, 150, 0.25)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (!isActive('/swipe') && !isActive('/')) {
                e.currentTarget.style.background = 'rgba(217, 192, 150, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive('/swipe') && !isActive('/')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <Search size={18} />
            <span>Discover</span>
          </Link>

          <Link 
            to="/matches" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/matches') ? '#3d302d' : 'rgba(61, 48, 45, 0.7)',
              fontWeight: isActive('/matches') ? '600' : '500',
              padding: '10px 18px',
              borderRadius: '14px',
              background: isActive('/matches') 
                ? 'rgba(217, 192, 150, 0.35)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isActive('/matches') 
                ? 'rgba(217, 192, 150, 0.4)' 
                : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive('/matches') 
                ? '0 4px 15px rgba(217, 192, 150, 0.25)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (!isActive('/matches')) {
                e.currentTarget.style.background = 'rgba(217, 192, 150, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive('/matches')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <Heart size={18} />
            <span>Matches</span>
          </Link>

          <Link 
            to="/chats" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/chats') || location.pathname.startsWith('/chat') ? '#3d302d' : 'rgba(61, 48, 45, 0.7)',
              fontWeight: isActive('/chats') || location.pathname.startsWith('/chat') ? '600' : '500',
              padding: '10px 18px',
              borderRadius: '14px',
              background: isActive('/chats') || location.pathname.startsWith('/chat')
                ? 'rgba(217, 192, 150, 0.35)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isActive('/chats') || location.pathname.startsWith('/chat')
                ? 'rgba(217, 192, 150, 0.4)' 
                : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive('/chats') || location.pathname.startsWith('/chat')
                ? '0 4px 15px rgba(217, 192, 150, 0.25)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (!isActive('/chats') && !location.pathname.startsWith('/chat')) {
                e.currentTarget.style.background = 'rgba(217, 192, 150, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive('/chats') && !location.pathname.startsWith('/chat')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <MessageCircle size={18} />
            <span>Chats</span>
          </Link>

          {/* Live Study Room Button - NOW USING /studyroom-entry */}
          <Link 
            to="/studyroom-entry" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/studyroom-entry') ? '#3d302d' : 'rgba(61, 48, 45, 0.7)',
              fontWeight: isActive('/studyroom-entry') ? '600' : '500',
              padding: '10px 18px',
              borderRadius: '14px',
              background: isActive('/studyroom-entry') 
                ? 'rgba(217, 192, 150, 0.35)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isActive('/studyroom-entry') 
                ? 'rgba(217, 192, 150, 0.4)' 
                : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive('/studyroom-entry') 
                ? '0 4px 15px rgba(217, 192, 150, 0.25)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (!isActive('/studyroom-entry')) {
                e.currentTarget.style.background = 'rgba(217, 192, 150, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive('/studyroom-entry')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <Clock size={18} />
            <span>Study Room</span>
          </Link>
          
          <Link 
            to="/profile" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: isActive('/profile') ? '#3d302d' : 'rgba(61, 48, 45, 0.7)',
              fontWeight: isActive('/profile') ? '600' : '500',
              padding: '10px 18px',
              borderRadius: '14px',
              background: isActive('/profile') 
                ? 'rgba(217, 192, 150, 0.35)' 
                : 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${isActive('/profile') 
                ? 'rgba(217, 192, 150, 0.4)' 
                : 'rgba(255, 255, 255, 0.15)'}`,
              transition: 'all 0.3s ease',
              boxShadow: isActive('/profile') 
                ? '0 4px 15px rgba(217, 192, 150, 0.25)' 
                : 'none'
            }}
            onMouseOver={(e) => {
              if (!isActive('/profile')) {
                e.currentTarget.style.background = 'rgba(217, 192, 150, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.25)';
              }
            }}
            onMouseOut={(e) => {
              if (!isActive('/profile')) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }
            }}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #886355, #3d302d)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '10px 20px',
              borderRadius: '14px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(136, 99, 85, 0.35)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(136, 99, 85, 0.5)';
              e.target.style.background = 'linear-gradient(135deg, #3d302d, #0b0706)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(136, 99, 85, 0.35)';
              e.target.style.background = 'linear-gradient(135deg, #886355, #3d302d)';
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};


export default Header;
