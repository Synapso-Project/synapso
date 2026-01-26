import React, { useState, useEffect } from 'react';
import CustomSwipeCard from '../components/CustomSwipeCard';
import { Users, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/CustomSwipeCard.css';

const SwipePage = () => {
  const [users, setUsers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [error, setError] = useState('');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
    fetchMatches();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/swipes/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUsers(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else if (error.response?.status === 404) {
        setError('No recommendations available at the moment.');
      } else {
        setError('Failed to load recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://127.0.0.1:8000/matches/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMatches(response.data.length || 0);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const handleSwipe = async (direction, userId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/swipes/', {
        swipee_id: userId,
        direction: direction
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSwipeCount(prev => prev + 1);

      if (direction === 'right') {
        fetchMatches();
        if (Math.random() > 0.7) {
          showMatchNotification();
        }
      }

      setCurrentIndex(prev => prev + 1);

      if (currentIndex >= users.length - 3) {
        fetchRecommendations();
      }

    } catch (error) {
      console.error('Error swiping:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to record swipe. Please try again.');
      }
    }
  };

  const showMatchNotification = () => {
    const notification = document.createElement('div');
    notification.textContent = "🎉 It's a Match!";
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(181, 145, 117, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(217, 192, 150, 0.5);
      color: white;
      padding: 25px 50px;
      border-radius: 20px;
      font-size: 1.5rem;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 15px 40px rgba(136, 99, 85, 0.4);
      animation: bounceIn 0.6s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const getVisibleCards = () => {
    return users.slice(currentIndex, currentIndex + 4);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
        }}>
          <RefreshCw size={40} style={{ 
            animation: 'spin 2s linear infinite', 
            marginBottom: '20px',
            color: '#3d302d'
          }} />
          <p style={{ 
            color: '#3d302d', 
            fontSize: '1.1rem',
            fontWeight: '500' 
          }}>
            Finding amazing study partners...
          </p>
        </div>
      </div>
    );
  }

  const visibleCards = getVisibleCards();

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '30px',
        gap: '15px'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          cursor: 'pointer',
          padding: '12px 20px',
          borderRadius: '14px',
          transition: 'all 0.3s ease',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
        onClick={() => navigate('/matches')}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(217, 192, 150, 0.35)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(217, 192, 150, 0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        >
          <span style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: '#3d302d'
          }}>
            {matches}
          </span>
          <small style={{ 
            fontSize: '0.85rem', 
            color: 'rgba(61, 48, 45, 0.8)',
            fontWeight: '600'
          }}>
            Matches
          </small>
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          padding: '12px 20px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <span style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            color: '#3d302d'
          }}>
            {Math.max(0, users.length - currentIndex)}
          </span>
          <small style={{ 
            fontSize: '0.85rem', 
            color: 'rgba(61, 48, 45, 0.8)',
            fontWeight: '600'
          }}>
            Remaining
          </small>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          color: '#e53e3e',
          padding: '16px 24px',
          marginBottom: '20px',
          borderRadius: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)'
        }}>
          <span style={{ fontWeight: '500' }}>{error}</span>
          <button 
            onClick={fetchRecommendations}
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(10px)',
              color: '#e53e3e',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '8px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Retry
          </button>
        </div>
      )}

      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}>
        {visibleCards.length > 0 ? (
          <div style={{
            position: 'relative',
            width: '380px',
            height: '580px'
          }}>
            {visibleCards.map((cardUser, index) => (
              <div
                key={cardUser._id || cardUser.id}
                style={{
                  position: 'absolute',
                  zIndex: visibleCards.length - index,
                  transform: `scale(${1 - index * 0.03}) translateY(${index * 8}px)`,
                  opacity: index === 0 ? 1 : 0.8 - index * 0.1
                }}
              >
                <CustomSwipeCard
                  user={cardUser}
                  onSwipe={handleSwipe}
                  onCardLeftScreen={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '50px 40px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            maxWidth: '400px'
          }}>
            <Users size={56} color="#3d302d" style={{ marginBottom: '20px', opacity: 0.7 }} />
            <h3 style={{ 
              color: '#3d302d', 
              fontSize: '1.5rem',
              marginBottom: '12px',
              fontWeight: '700'
            }}>
              No more profiles!
            </h3>
            <p style={{ 
              color: 'rgba(61, 48, 45, 0.7)', 
              marginBottom: '30px',
              fontSize: '1rem'
            }}>
              You've seen all available study partners
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={fetchRecommendations}
                style={{
                  background: 'linear-gradient(135deg, #d9c096, #b59175)',
                  color: '#3d302d',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(217, 192, 150, 0.3)'
                }}
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button 
                onClick={() => navigate('/matches')}
                style={{
                  background: 'rgba(136, 99, 85, 0.3)',
                  backdropFilter: 'blur(10px)',
                  color: '#3d302d',
                  border: '1px solid rgba(136, 99, 85, 0.4)',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
              >
                <MessageCircle size={18} />
                View Matches ({matches})
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '25px',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '14px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <p style={{ 
          margin: '0 0 10px 0', 
          fontSize: '0.95rem',
          color: 'rgba(61, 48, 45, 0.8)',
          fontWeight: '500'
        }}>
          💡 Swipe right to connect with study partners
        </p>
        <div style={{ 
          fontSize: '0.85rem', 
          color: 'rgba(61, 48, 45, 0.6)',
          fontWeight: '500'
        }}>
          <span>{swipeCount} swipes today</span>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;
