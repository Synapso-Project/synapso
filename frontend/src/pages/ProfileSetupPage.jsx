import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, ChevronLeft, BookOpen, Clock, Users } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'https://synapso-backend.onrender.com';

const ProfileSetupPage = () => {
  const [formData, setFormData] = useState({
    subjects: '',
    availability: '',
    bio: '',
    studyGoals: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 🔥 FIXED: Parse comma-separated → arrays + Correct endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      
      // 🔥 CRITICAL FIX: Convert strings → arrays for backend
      const profileData = {
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s),
        availability: formData.availability.split(',').map(a => a.trim()).filter(a => a),
        bio: formData.bio,
        study_habits: formData.studyGoals ? formData.studyGoals.split(',').map(g => g.trim()).filter(g => g) : [],
        profile_completed: true
      };

      console.log('🔥 SENDING:', profileData);

      // 🔥 FIXED: POST /users/profile (your new endpoint!)
      const response = await axios.post(`${API_BASE}/users/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Profile saved:', response.data);
      setSuccess('Profile updated successfully! 🎉 Starting swipe...');
      
      setTimeout(() => {
        navigate('/swipe');
      }, 2000);

    } catch (error) {
      console.error('❌ Profile update error:', error.response?.data || error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        navigate('/login');
      } else if (error.response?.status === 405) {
        setError('Endpoint not found. Backend needs POST /users/profile endpoint.');
      } else {
        setError(error.response?.data?.detail || 'Failed to update profile.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const commonInputStyle = {
    width: '100%',
    padding: '18px 20px',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '14px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    color: '#3d302d',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '20px'
  };

  const focusInputStyle = {
    background: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(217, 192, 150, 0.5)',
    boxShadow: '0 0 0 3px rgba(217, 192, 150, 0.1)'
  };

  return (
    <div style={{
      minHeight: '100vh',
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
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            marginBottom: '12px',
            fontWeight: '800',
            color: '#3d302d'
          }}>
            Complete Your Profile
          </h1>
          <p style={{ 
            color: 'rgba(61, 48, 45, 0.8)',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Tell us about your study preferences
          </p>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '4px', 
            marginTop: '20px' 
          }}>
            {[1,2,3,4].map(s => (
              <div key={s} style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: s <= step ? '#886355' : 'rgba(136, 99, 85, 0.3)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#3d302d', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  fontSize: '0.95rem'
                }}>
                  <BookOpen size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  What subjects do you study? (comma separated)
                </label>
                <textarea
                  name="subjects"
                  placeholder="Math, Physics, Chemistry, Biology..."
                  value={formData.subjects}
                  onChange={handleChange}
                  rows={4}
                  required
                  style={{ ...commonInputStyle, resize: 'vertical', minHeight: '120px' }}
                  onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#3d302d', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  fontSize: '0.95rem'
                }}>
                  <Clock size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  When are you available? (comma separated)
                </label>
                <textarea
                  name="availability"
                  placeholder="Mon 18-20, Wed 16-18, Fri 14-16..."
                  value={formData.availability}
                  onChange={handleChange}
                  rows={3}
                  required
                  style={commonInputStyle}
                  onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#3d302d', 
                  fontWeight: '600', 
                  marginBottom: '8px',
                  fontSize: '0.95rem'
                }}>
                  <Users size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                  Tell us about yourself (max 200 chars)
                </label>
                <textarea
                  name="bio"
                  placeholder="3rd year CS student passionate about algorithms and web dev..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={200}
                  required
                  style={{ ...commonInputStyle, resize: 'vertical', minHeight: '120px' }}
                  onFocus={(e) => Object.assign(e.target.style, focusInputStyle)}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.85rem', 
                  color: 'rgba(61, 48, 45, 0.6)' 
                }}>
                  {formData.bio.length}/200
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CheckCircle size={64} style={{ color: '#38a169', marginBottom: '20px' }} />
                <h2 style={{ color: '#3d302d', fontWeight: '700', marginBottom: '12px' }}>
                  Almost Done!
                </h2>
                <p style={{ color: 'rgba(61, 48, 45, 0.8)', marginBottom: '32px' }}>
                  Review your study preferences and click save to start swiping!
                </p>
                {/* 🔥 Show preview data */}
                <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
                  <strong>Subjects:</strong> {formData.subjects.split(',').map(s => s.trim()).join(', ')}<br/>
                  <strong>Availability:</strong> {formData.availability.split(',').map(a => a.trim()).join(', ')}<br/>
                  <strong>Bio:</strong> {formData.bio.substring(0, 100)}...
                </div>
              </div>
            </>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#e53e3e',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(56, 161, 105, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#38a169',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              border: '1px solid rgba(56, 161, 105, 0.3)',
              fontWeight: '500'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#3d302d',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <ChevronLeft size={18} style={{ display: 'inline', marginRight: '8px' }} />
                Previous
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #b59175, #886355)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Next Step →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  background: loading 
                    ? 'rgba(181, 145, 117, 0.5)' 
                    : 'linear-gradient(135deg, #b59175, #886355)',
                  color: 'white',
                  border: 'none',
                  padding: '18px',
                  borderRadius: '14px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {loading ? 'Saving...' : 'Save & Start Swiping!'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
