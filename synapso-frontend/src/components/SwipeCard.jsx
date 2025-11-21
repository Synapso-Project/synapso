import React, { useState, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import { Heart, X, User, Clock, BookOpen } from 'lucide-react';
import './SwipeCard.css';

const SwipeCard = ({ user, onSwipe, onCardLeftScreen }) => {
  const [lastDirection, setLastDirection] = useState();
  const cardRef = useRef();

  const swiped = (direction, userId) => {
    setLastDirection(direction);
    onSwipe(direction, userId);
  };

  const outOfFrame = (userId) => {
    console.log(userId + ' left the screen!');
    onCardLeftScreen(userId);
  };

  const swipe = async (dir) => {
    if (cardRef.current) {
      await cardRef.current.swipe(dir);
    }
  };

  return (
    <TinderCard
      ref={cardRef}
      className="swipe-card"
      key={user.id}
      onSwipe={(dir) => swiped(dir, user.id)}
      onCardLeftScreen={() => outOfFrame(user.id)}
      preventSwipe={['up', 'down']}
      swipeRequirementType="position"
      swipeThreshold={300}
    >
      <div className="card">
        <div className="card-header">
          <div className="user-avatar">
            <User size={48} />
          </div>
          <div className="user-info">
            <h2 className="username">{user.username}</h2>
            <p className="email">{user.email}</p>
          </div>
        </div>

        <div className="card-content">
          <div className="subjects-section">
            <div className="section-header">
              <BookOpen size={16} />
              <span>Subjects</span>
            </div>
            <div className="subjects-list">
              {user.subjects?.map((subject, index) => (
                <span key={index} className="subject-tag">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          <div className="availability-section">
            <div className="section-header">
              <Clock size={16} />
              <span>Available</span>
            </div>
            <div className="availability-list">
              {user.availability?.map((time, index) => (
                <span key={index} className="availability-tag">
                  {time}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card-actions">
          <button 
            className="action-btn reject-btn"
            onClick={() => swipe('left')}
          >
            <X size={24} />
          </button>
          <button 
            className="action-btn like-btn"
            onClick={() => swipe('right')}
          >
            <Heart size={24} />
          </button>
        </div>
      </div>
    </TinderCard>
  );
};

export default SwipeCard;
