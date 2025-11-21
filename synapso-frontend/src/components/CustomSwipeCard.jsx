import React, { useState } from 'react';
import TinderCard from 'react-tinder-card';
import { X, Heart, Star, Clock, BookOpen, Sparkles, User as UserIcon, Info } from 'lucide-react';
import './CustomSwipeCard.css';

const CustomSwipeCard = ({ user, onSwipe, onCardLeftScreen }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleSwipe = (direction) => {
    console.log('Swiped ' + direction + ' on ' + user.username);
    onSwipe(direction, user._id || user.id);
  };

  const matchPercentage = user.match_percentage || Math.floor(Math.random() * 20) + 80;

  return (
    <TinderCard
      onSwipe={handleSwipe}
      onCardLeftScreen={onCardLeftScreen}
      preventSwipe={['up', 'down']}
      className="swipe-card"
    >
      <div style={{
        width: '380px',
        height: '580px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '2px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Decorative Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '180px',
          background: 'linear-gradient(135deg, #d9c096 0%, #b59175 50%, #886355 100%)',
          opacity: 0.15,
          borderRadius: '28px 28px 0 0',
          zIndex: 0
        }} />

        {/* Match Badge */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #b59175, #886355)',
          padding: '8px 18px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'white',
          fontSize: '0.85rem',
          fontWeight: '700',
          boxShadow: '0 6px 20px rgba(136, 99, 85, 0.4)',
          zIndex: 2,
          border: '2px solid rgba(255, 255, 255, 0.3)'
        }}>
          <Sparkles size={16} fill="white" />
          {matchPercentage}% Match
        </div>

        {/* Profile Header */}
        <div style={{
          padding: '28px 26px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d9c096, #b59175)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            fontWeight: 'bold',
            color: 'white',
            border: '4px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 8px 25px rgba(136, 99, 85, 0.35)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              animation: 'shimmer 3s infinite'
            }} />
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '1.9rem', 
              fontWeight: '800',
              background: 'linear-gradient(135deg, #3d302d, #886355)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.5px'
            }}>
              {user.username || 'Student'}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: 'rgba(217, 192, 150, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              width: 'fit-content',
              border: '1px solid rgba(217, 192, 150, 0.3)'
            }}>
              <UserIcon size={14} color="#886355" />
              <span style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: '#886355'
              }}>
                🎓 Student
              </span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{
          flex: 1,
          padding: '0 26px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Bio Card */}
          {user.bio && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(217, 192, 150, 0.15), rgba(181, 145, 117, 0.15))',
              backdropFilter: 'blur(10px)',
              padding: '18px 20px',
              borderRadius: '18px',
              border: '1px solid rgba(217, 192, 150, 0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '80px',
                height: '80px',
                background: 'radial-gradient(circle, rgba(217, 192, 150, 0.3) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              <p style={{ 
                margin: 0, 
                color: '#3d302d',
                fontSize: '0.95rem',
                fontWeight: '500',
                fontStyle: 'italic',
                lineHeight: '1.6',
                position: 'relative'
              }}>
                "{user.bio || 'Student looking for study partners'}"
              </p>
            </div>
          )}

          {/* Subjects Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #d9c096, #b59175)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(181, 145, 117, 0.3)'
              }}>
                <BookOpen size={18} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '1.05rem',
                color: '#3d302d'
              }}>
                Studying
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {user.subjects && user.subjects.length > 0 ? (
                user.subjects.map((subject, index) => (
                  <span key={index} style={{
                    background: 'linear-gradient(135deg, #d9c096, #c4a57b)',
                    color: '#3d302d',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    boxShadow: '0 3px 12px rgba(217, 192, 150, 0.3)',
                    border: '1.5px solid rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s'
                  }}>
                    {subject}
                  </span>
                ))
              ) : (
                <span style={{
                  background: 'linear-gradient(135deg, #d9c096, #c4a57b)',
                  color: '#3d302d',
                  padding: '10px 18px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  boxShadow: '0 3px 12px rgba(217, 192, 150, 0.3)',
                  border: '1.5px solid rgba(255, 255, 255, 0.5)'
                }}>
                  General Studies
                </span>
              )}
            </div>
          </div>

          {/* Availability Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '14px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #886355, #3d302d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(136, 99, 85, 0.3)'
              }}>
                <Clock size={18} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '1.05rem',
                color: '#3d302d'
              }}>
                Available
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {user.availability && user.availability.length > 0 ? (
                user.availability.map((time, index) => (
                  <span key={index} style={{
                    background: 'rgba(136, 99, 85, 0.15)',
                    backdropFilter: 'blur(10px)',
                    color: '#3d302d',
                    padding: '9px 16px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    border: '1.5px solid rgba(136, 99, 85, 0.25)'
                  }}>
                    {time}
                  </span>
                ))
              ) : (
                <span style={{
                  background: 'rgba(136, 99, 85, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#3d302d',
                  padding: '9px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  border: '1.5px solid rgba(136, 99, 85, 0.25)'
                }}>
                  Mon 18-20
                </span>
              )}
            </div>
          </div>

          {/* Study Style */}
          {user.study_style && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(181, 145, 117, 0.12), rgba(136, 99, 85, 0.12))',
              backdropFilter: 'blur(10px)',
              padding: '16px 20px',
              borderRadius: '16px',
              border: '1px solid rgba(181, 145, 117, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Star size={20} color="#886355" strokeWidth={2.5} fill="rgba(136, 99, 85, 0.3)" />
              <div>
                <div style={{ fontSize: '0.75rem', color: '#886355', fontWeight: '600', marginBottom: '2px' }}>
                  Study Style
                </div>
                <div style={{ fontSize: '0.95rem', color: '#3d302d', fontWeight: '700' }}>
                  {user.study_style}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Action Buttons */}
        <div style={{
          padding: '24px 26px 28px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(15px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          position: 'relative'
        }}>
          <button
            onClick={() => handleSwipe('left')}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '3px solid rgba(239, 68, 68, 0.4)',
              color: '#e53e3e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.transform = 'scale(1.15) rotate(-10deg)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.25)';
            }}
          >
            <X size={30} strokeWidth={3.5} />
          </button>

          <button
            onClick={() => handleSwipe('right')}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #b59175, #886355)',
              border: '4px solid rgba(255, 255, 255, 0.8)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 10px 30px rgba(136, 99, 85, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 2
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(136, 99, 85, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(136, 99, 85, 0.5)';
            }}
          >
            <Heart size={36} strokeWidth={3.5} fill="white" />
          </button>

          <button
            onClick={() => alert('Super like! ⭐')}
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              border: '3px solid rgba(217, 192, 150, 0.5)',
              color: '#d9c096',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 20px rgba(217, 192, 150, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(217, 192, 150, 0.2)';
              e.currentTarget.style.transform = 'scale(1.15) rotate(10deg)';
              e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.7)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(217, 192, 150, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.borderColor = 'rgba(217, 192, 150, 0.5)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(217, 192, 150, 0.3)';
            }}
          >
            <Star size={30} strokeWidth={3.5} fill="#d9c096" />
          </button>
        </div>
      </div>
    </TinderCard>
  );
};

export default CustomSwipeCard;
