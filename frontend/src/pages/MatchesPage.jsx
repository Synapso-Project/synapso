import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get('http://https://synapso-app.onrender.com/matches/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMatches(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const startChat = (matchId) => {
    navigate(`/chat/${matchId}`);
  };

  // Add this function to handle viewing user profiles
  const viewProfile = (userId) => {
    navigate(`/user/${userId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just matched';
    if (diffHours < 24) return `${diffHours}h ago`;
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
          Loading matches...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
      padding: '30px 20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '35px',
        maxWidth: '700px',
        margin: '0 auto',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              color: '#3d302d',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '2rem',
              fontWeight: '800'
            }}>
              <Users size={32} />
              Your Matches
            </h1>
            <p style={{ 
              margin: 0, 
              color: 'rgba(61, 48, 45, 0.7)',
              fontSize: '1rem',
              fontWeight: '500'
            }}>
              {matches.length} study partner{matches.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#e53e3e',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontWeight: '500'
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {matches.length > 0 ? (
            matches.map((match, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
              }}
              >
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #b59175, #886355)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  flexShrink: 0,
                  boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
                }}>
                  {(match.username || match.name || 'U').charAt(0).toUpperCase()}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ 
                    margin: '0 0 6px 0',
                    color: '#3d302d',
                    fontSize: '1.2rem',
                    fontWeight: '700'
                  }}>
                    {match.username || match.name || 'Study Partner'}
                  </h3>
                  
                  <p style={{ 
                    margin: '0 0 10px 0',
                    color: 'rgba(61, 48, 45, 0.7)',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: '500'
                  }}>
                    {match.subjects?.length > 0 
                      ? match.subjects.join(', ')
                      : match.email || 'Common subjects'
                    }
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(61, 48, 45, 0.6)',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    <Clock size={14} />
                    {match.matched_at 
                      ? formatDate(match.matched_at)
                      : 'Recently matched'
                    }
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => startChat(match.match_id)}
                    style={{
                      background: 'linear-gradient(135deg, #b59175, #886355)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s',
                      minWidth: '110px',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 6px 20px rgba(136, 99, 85, 0.4)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 4px 15px rgba(136, 99, 85, 0.3)';
                    }}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </button>
                  
                  <button
                    onClick={() => viewProfile(match.user_id || match.id)}
                    style={{
                      background: 'rgba(181, 145, 117, 0.2)',
                      backdropFilter: 'blur(10px)',
                      color: '#3d302d',
                      border: '1px solid rgba(181, 145, 117, 0.3)',
                      padding: '10px 20px',
                      borderRadius: '14px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      minWidth: '110px',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(181, 145, 117, 0.35)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(181, 145, 117, 0.2)';
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center',
              padding: '60px 30px',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <Users size={70} style={{ 
                marginBottom: '24px',
                color: '#3d302d',
                opacity: 0.5
              }} />
              <h3 style={{ 
                color: '#3d302d',
                margin: '0 0 12px 0',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                No matches yet
              </h3>
              <p style={{ 
                margin: '0 0 35px 0',
                fontSize: '1rem',
                lineHeight: '1.6',
                color: 'rgba(61, 48, 45, 0.7)',
                fontWeight: '500'
              }}>
                Keep swiping right on study partners you'd like to work with!<br/>
                When they swipe right on you too, you'll see them here.
              </p>
              <button 
                onClick={() => navigate('/swipe')}
                style={{
                  background: 'linear-gradient(135deg, #b59175, #886355)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '1.05rem',
                  transition: 'all 0.3s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
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
                <Users size={22} />
                Start Swiping
              </button>
            </div>
          )}
        </div>

        {matches.length > 0 && (
          <div style={{
            marginTop: '30px',
            padding: '24px',
            background: 'rgba(181, 145, 117, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '18px',
            textAlign: 'center',
            border: '1px solid rgba(181, 145, 117, 0.25)'
          }}>
            <p style={{ 
              margin: '0 0 18px 0',
              color: 'rgba(61, 48, 45, 0.8)',
              fontSize: '0.95rem',
              fontWeight: '600'
            }}>
              Want to find more study partners?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/chats')}
                style={{
                  background: 'rgba(136, 99, 85, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(136, 99, 85, 0.3)',
                  color: '#3d302d',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(136, 99, 85, 0.35)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(136, 99, 85, 0.2)';
                }}
              >
                View All Chats
              </button>
              <button
                onClick={() => navigate('/swipe')}
                style={{
                  background: 'linear-gradient(135deg, #b59175, #886355)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(136, 99, 85, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(136, 99, 85, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(136, 99, 85, 0.3)';
                }}
              >
                Find More Partners
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;

