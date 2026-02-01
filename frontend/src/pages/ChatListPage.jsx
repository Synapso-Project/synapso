import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Clock } from 'lucide-react';
import axios from 'axios';

// ✅ FIXED: Backend URL consistency
const API_BASE = 'https://synapso-backend.onrender.com';

const ChatListPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  // ✅ FIXED: Correct endpoint + 401 handling + error UI
  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_BASE}/users/matches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      if (error.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load conversations');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '5h ago';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: '30px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#3d302d',
          fontWeight: '600',
          fontSize: '1.1rem'
        }}>
          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
      padding: '30px 20px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '28px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#e53e3e',
            padding: '14px 20px',
            borderRadius: '12px',
            margin: '20px',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            textAlign: 'center'
          }}>
            {error}
            <button 
              onClick={fetchMatches}
              style={{
                marginLeft: '10px',
                background: 'none',
                border: 'none',
                color: '#e53e3e',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #b59175, #886355)',
          padding: '30px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(136, 99, 85, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '10px'
          }}>
            <MessageCircle size={32} strokeWidth={2.5} />
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: '800',
              letterSpacing: '-0.5px'
            }}>
              Your Conversations
            </h1>
          </div>
          <p style={{
            margin: 0,
            opacity: 0.95,
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            {matches.length} active chat{matches.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Chat List */}
        <div style={{ padding: '20px' }}>
          {matches.length > 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {matches.map((match) => (
                <div
                  key={match.id || match.match_id}
                  onClick={() => navigate(`/chat/${match.id || match.match_id}`)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    borderRadius: '18px',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #b59175, #886355)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    border: '3px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
                  }}>
                    {(match.username || match.name || 'U').charAt(0).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      margin: '0 0 6px 0',
                      color: '#3d302d',
                      fontSize: '1.15rem',
                      fontWeight: '700'
                    }}>
                      {match.username || match.name || 'Study Partner'}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: 'rgba(61, 48, 45, 0.7)',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {match.last_message || 'Start a conversation!'}
                    </p>
                  </div>

                  {/* Time */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(61, 48, 45, 0.6)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    <Clock size={14} />
                    {formatTime(match.matched_at || match.last_message_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <MessageCircle
                size={64}
                style={{
                  marginBottom: '24px',
                  color: '#3d302d',
                  opacity: 0.5
                }}
              />
              <h3 style={{
                color: '#3d302d',
                margin: '0 0 12px 0',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                No conversations yet
              </h3>
              <p style={{
                color: 'rgba(61, 48, 45, 0.7)',
                margin: '0 0 30px 0',
                fontSize: '1rem',
                fontWeight: '500',
                lineHeight: '1.6'
              }}>
                Start matching with study partners<br />
                to begin chatting!
              </p>
              <button
                onClick={() => navigate('/swipe')}
                style={{
                  background: 'linear-gradient(135deg, #b59175, #886355)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 20px rgba(136, 99, 85, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 25px rgba(136, 99, 85, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(136, 99, 85, 0.3)';
                }}
              >
                Start Swiping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;
