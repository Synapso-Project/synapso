import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, BookOpen, Clock, Heart, Brain, MapPin } from 'lucide-react';
import axios from 'axios';
import Header from '../components/Header';

const UserProfileView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`http://https://synapso-app.onrender.com/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
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
            Loading profile...
          </div>
        </div>
      </>
    );
  }

  if (error || !userProfile) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: 'calc(100vh - 80px)',
          background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '40px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            <h2 style={{ color: '#3d302d', marginBottom: '16px' }}>Profile Not Found</h2>
            <p style={{ color: 'rgba(61, 48, 45, 0.7)', marginBottom: '24px' }}>{error}</p>
            <button
              onClick={() => navigate('/matches')}
              style={{
                background: 'linear-gradient(135deg, #b59175, #886355)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={18} />
              Back to Matches
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{
        minHeight: 'calc(100vh - 80px)',
        background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
        padding: '30px 20px'
      }}>
        <div style={{
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          <button
            onClick={() => navigate('/matches')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#3d302d',
              padding: '10px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <ArrowLeft size={18} />
            Back to Matches
          </button>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '35px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #b59175, #886355)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                fontWeight: 'bold',
                margin: '0 auto 20px',
                boxShadow: '0 8px 25px rgba(136, 99, 85, 0.4)'
              }}>
                {userProfile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              
              <h1 style={{
                color: '#3d302d',
                margin: '0 0 8px 0',
                fontSize: '2rem',
                fontWeight: '800'
              }}>
                {userProfile.username || 'Study Partner'}
              </h1>
              
              <p style={{
                color: 'rgba(61, 48, 45, 0.7)',
                margin: 0,
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                {userProfile.email}
              </p>
            </div>

            {userProfile.bio && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <h3 style={{ color: '#3d302d', margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: '700' }}>
                  About
                </h3>
                <p style={{ color: 'rgba(61, 48, 45, 0.8)', margin: 0, lineHeight: '1.6' }}>
                  {userProfile.bio}
                </p>
              </div>
            )}

            {userProfile.subjects && userProfile.subjects.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <h3 style={{
                  color: '#3d302d',
                  margin: '0 0 16px 0',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <BookOpen size={20} />
                  Subjects
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userProfile.subjects.map((subject, index) => (
                    <span key={index} style={{
                      background: 'linear-gradient(135deg, #b59175, #886355)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}>
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userProfile.interests && userProfile.interests.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <h3 style={{
                  color: '#3d302d',
                  margin: '0 0 16px 0',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Heart size={20} />
                  Interests
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userProfile.interests.map((interest, index) => (
                    <span key={index} style={{
                      background: 'rgba(181, 145, 117, 0.3)',
                      color: '#3d302d',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      border: '1px solid rgba(181, 145, 117, 0.4)'
                    }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {userProfile.study_habits && userProfile.study_habits.length > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                padding: '20px',
                borderRadius: '16px',
                marginBottom: '20px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <h3 style={{
                  color: '#3d302d',
                  margin: '0 0 16px 0',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Brain size={20} />
                  Study Habits
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {userProfile.study_habits.map((habit, index) => (
                    <span key={index} style={{
                      background: 'rgba(181, 145, 117, 0.3)',
                      color: '#3d302d',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      border: '1px solid rgba(181, 145, 117, 0.4)'
                    }}>
                      {habit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {userProfile.study_style && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <p style={{ color: 'rgba(61, 48, 45, 0.7)', margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: '600' }}>
                    Study Style
                  </p>
                  <p style={{ color: '#3d302d', margin: 0, fontWeight: '700' }}>
                    {userProfile.study_style}
                  </p>
                </div>
              )}

              {userProfile.preferred_study_time && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <p style={{ color: 'rgba(61, 48, 45, 0.7)', margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: '600' }}>
                    Preferred Time
                  </p>
                  <p style={{ color: '#3d302d', margin: 0, fontWeight: '700' }}>
                    {userProfile.preferred_study_time}
                  </p>
                </div>
              )}

              {userProfile.study_location && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  backdropFilter: 'blur(10px)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <p style={{ color: 'rgba(61, 48, 45, 0.7)', margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: '600' }}>
                    Study Location
                  </p>
                  <p style={{ color: '#3d302d', margin: 0, fontWeight: '700' }}>
                    {userProfile.study_location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfileView;
