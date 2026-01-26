import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, BookOpen, Clock, Heart, Brain, Target, Coffee, 
  Moon, Sun, Users, Home, CheckCircle, Save 
} from 'lucide-react';
import axios from 'axios';
import './ProfileSetupPage.css';

const ProfileSetupPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    bio: '',
    subjects: [],
    availability: [],
    studyHabits: [],
    interests: [],
    studyStyle: '',
    preferredStudyTime: '',
    studyLocation: '',
    academicLevel: '',
    goals: []
  });

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Geography', 'Economics', 'Psychology',
    'Philosophy', 'Literature', 'Art', 'Music', 'Languages',
    'Engineering', 'Medicine', 'Law', 'Business', 'Finance'
  ];

  const availabilityOptions = [
    'Mon 09-12', 'Mon 13-16', 'Mon 17-20', 'Mon 21-23',
    'Tue 09-12', 'Tue 13-16', 'Tue 17-20', 'Tue 21-23',
    'Wed 09-12', 'Wed 13-16', 'Wed 17-20', 'Wed 21-23',
    'Thu 09-12', 'Thu 13-16', 'Thu 17-20', 'Thu 21-23',
    'Fri 09-12', 'Fri 13-16', 'Fri 17-20', 'Fri 21-23',
    'Sat 09-12', 'Sat 13-16', 'Sat 17-20', 'Sat 21-23',
    'Sun 09-12', 'Sun 13-16', 'Sun 17-20', 'Sun 21-23'
  ];

  const studyHabitOptions = [
    'Group Study', 'Solo Study', 'Discussion Based', 'Note Taking',
    'Flashcards', 'Mind Maps', 'Practice Problems', 'Research',
    'Presentations', 'Peer Teaching', 'Online Resources', 'Library Study'
  ];

  const interestOptions = [
    'Technology', 'Sports', 'Music', 'Art', 'Travel', 'Reading',
    'Gaming', 'Movies', 'Cooking', 'Photography', 'Fitness',
    'Nature', 'Science', 'History', 'Politics', 'Environment'
  ];

  const handleMultiSelect = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      console.log('Saving profile data:', profileData);
      
      const backendData = {
        subjects: profileData.subjects,
        availability: profileData.availability,
        study_habits: profileData.studyHabits,
        interests: profileData.interests,
        bio: profileData.bio || null,
        study_style: profileData.studyStyle || null,
        preferred_study_time: profileData.preferredStudyTime || null,
        study_location: profileData.studyLocation || null,
        academic_level: profileData.academicLevel || null,
        goals: typeof profileData.goals === 'string' 
          ? profileData.goals.split(', ').filter(g => g.trim()) 
          : profileData.goals
      };
      console.log('Sending to backend:', backendData);
      
      const response = await axios.put('http://127.0.0.1:8000/users/profile', backendData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Profile saved successfully:', response.data);
      
      showSuccessNotification();
      
      setTimeout(() => {
        navigate('/swipe');
      }, 2000);
      
    } catch (error) {
      console.error('Profile setup error:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        alert('Profile endpoint not found. Using mock save for now...');
        setTimeout(() => {
          navigate('/swipe');
        }, 1000);
      } else {
        alert(`Failed to save profile: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="color: #38a169; font-size: 1.5rem;">✅</div>
        <div>
          <div style="font-weight: bold; font-size: 1.1rem;">Profile Setup Complete!</div>
          <div style="font-size: 0.9rem; margin-top: 5px;">Ready to find study partners...</div>
        </div>
      </div>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #2d3748;
      padding: 20px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      z-index: 10000;
      border-left: 4px solid #38a169;
      animation: slideIn 0.5s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideIn 0.5s ease reverse';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        }, 500);
      }
    }, 3000);
  };

  const previewProfileData = () => {
    const summary = `
🎓 Profile Summary:
━━━━━━━━━━━━━━━━━━

📚 Subjects (${profileData.subjects.length}):
${profileData.subjects.join(', ') || 'None selected'}

⏰ Availability (${profileData.availability.length}):
${profileData.availability.join(', ') || 'None selected'}

🧠 Study Habits (${profileData.studyHabits.length}):
${profileData.studyHabits.join(', ') || 'None selected'}

❤️ Interests (${profileData.interests.length}):
${profileData.interests.join(', ') || 'None selected'}

📖 Bio: ${profileData.bio || 'Not provided'}
🎯 Study Style: ${profileData.studyStyle || 'Not selected'}
🕐 Preferred Time: ${profileData.preferredStudyTime || 'Not selected'}
📍 Location: ${profileData.studyLocation || 'Not selected'}
🎓 Academic Level: ${profileData.academicLevel || 'Not selected'}
    `;
    
    console.log(summary);
    alert(summary);
  };

  const renderStep1 = () => (
    <div className="step-content">
      <div className="step-header">
        <BookOpen size={32} />
        <h2>What do you want to study?</h2>
        <p>Select subjects you're interested in studying</p>
      </div>
      
      <div className="options-grid">
        {subjectOptions.map(subject => (
          <button
            key={subject}
            className={`option-btn ${profileData.subjects.includes(subject) ? 'selected' : ''}`}
            onClick={() => handleMultiSelect('subjects', subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="bio-section">
        <label>Tell us about yourself (optional)</label>
        <textarea
          value={profileData.bio}
          onChange={(e) => handleInputChange('bio', e.target.value)}
          placeholder="I'm a computer science student who loves problem-solving..."
          maxLength={200}
        />
        <small style={{ color: '#718096', fontSize: '0.8rem' }}>
          {profileData.bio.length}/200 characters
        </small>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="step-content">
      <div className="step-header">
        <Clock size={32} />
        <h2>When are you available?</h2>
        <p>Select your preferred study times</p>
      </div>
      
      <div className="availability-grid">
        {availabilityOptions.map(time => (
          <button
            key={time}
            className={`option-btn ${profileData.availability.includes(time) ? 'selected' : ''}`}
            onClick={() => handleMultiSelect('availability', time)}
          >
            {time}
          </button>
        ))}
      </div>

      <div className="study-preferences">
        <div className="preference-group">
          <label>Preferred Study Time</label>
          <select 
            value={profileData.preferredStudyTime}
            onChange={(e) => handleInputChange('preferredStudyTime', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="early-morning">Early Morning (6-9 AM)</option>
            <option value="morning">Morning (9-12 PM)</option>
            <option value="afternoon">Afternoon (12-5 PM)</option>
            <option value="evening">Evening (5-9 PM)</option>
            <option value="night">Night (9 PM+)</option>
          </select>
        </div>

        <div className="preference-group">
          <label>Study Location</label>
          <select 
            value={profileData.studyLocation}
            onChange={(e) => handleInputChange('studyLocation', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="library">Library</option>
            <option value="home">Home</option>
            <option value="cafe">Cafe</option>
            <option value="campus">Campus</option>
            <option value="online">Online</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="step-content">
      <div className="step-header">
        <Brain size={32} />
        <h2>How do you study best?</h2>
        <p>Select your study habits and preferences</p>
      </div>
      
      <div className="options-grid">
        {studyHabitOptions.map(habit => (
          <button
            key={habit}
            className={`option-btn ${profileData.studyHabits.includes(habit) ? 'selected' : ''}`}
            onClick={() => handleMultiSelect('studyHabits', habit)}
          >
            {habit}
          </button>
        ))}
      </div>

      <div className="study-style-section">
        <label>Study Style</label>
        <div className="radio-group">
          {['Visual Learner', 'Auditory Learner', 'Kinesthetic Learner', 'Reading/Writing'].map(style => (
            <button
              key={style}
              className={`radio-btn ${profileData.studyStyle === style ? 'selected' : ''}`}
              onClick={() => handleInputChange('studyStyle', style)}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="step-content">
      <div className="step-header">
        <Heart size={32} />
        <h2>What are your interests?</h2>
        <p>Help us find study partners with similar interests</p>
      </div>
      
      <div className="options-grid">
        {interestOptions.map(interest => (
          <button
            key={interest}
            className={`option-btn ${profileData.interests.includes(interest) ? 'selected' : ''}`}
            onClick={() => handleMultiSelect('interests', interest)}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="academic-section">
        <div className="preference-group">
          <label>Academic Level</label>
          <select 
            value={profileData.academicLevel}
            onChange={(e) => handleInputChange('academicLevel', e.target.value)}
          >
            <option value="">Select...</option>
            <option value="high-school">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
            <option value="phd">PhD</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div className="goals-section">
          <label>Study Goals (optional)</label>
          <textarea
            value={profileData.goals.join(', ')}
            onChange={(e) => handleInputChange('goals', e.target.value.split(', ').filter(g => g.trim()))}
            placeholder="Pass exams, improve grades, learn new skills..."
            maxLength={150}
          />
          <small style={{ color: '#718096', fontSize: '0.8rem' }}>
            Separate multiple goals with commas
          </small>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={previewProfileData}
          style={{
            background: '#e2e8f0',
            color: '#4a5568',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          👀 Preview Profile Data
        </button>
      </div>
    </div>
  );

  return (
    <div className="profile-setup-page">
      <div className="setup-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
        </div>

        <div className="step-indicator">
          <span>Step {currentStep} of 4</span>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="navigation-buttons">
          {currentStep > 1 && (
            <button onClick={prevStep} className="nav-btn prev-btn">
              Previous
            </button>
          )}
          
          {currentStep < 4 ? (
            <button 
              onClick={nextStep} 
              className="nav-btn next-btn"
              disabled={
                (currentStep === 1 && profileData.subjects.length === 0) ||
                (currentStep === 2 && profileData.availability.length === 0) ||
                (currentStep === 3 && profileData.studyHabits.length === 0)
              }
            >
              Next
            </button>
          ) : (
            <button 
              onClick={handleSubmit} 
              className="nav-btn finish-btn"
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : (
                <>
                  <Save size={16} />
                  Complete Profile
                </>
              )}
            </button>
          )}
        </div>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '0.8rem', 
          color: '#718096' 
        }}>
          Selected: {profileData.subjects.length} subjects, {profileData.availability.length} time slots, {profileData.studyHabits.length} habits, {profileData.interests.length} interests
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;

