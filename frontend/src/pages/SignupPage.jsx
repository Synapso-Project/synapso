import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import axios from 'axios';

// ✅ FIXED: Backend URL consistency
const API_BASE = 'https://synapso-backend.onrender.com';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // ✅ FIXED: Correct backend URL
      const signupResponse = await axios.post(`${API_BASE}/users/signup`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setSuccess('Account created successfully! Logging you in...');

      try {
        // ✅ FIXED: Correct backend URL for login
        const loginResponse = await axios.post(`${API_BASE}/users/login`, {
          email: formData.email,
          password: formData.password
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (loginResponse.data && loginResponse.data.access_token) {
          localStorage.setItem('access_token', loginResponse.data.access_token);
          login(loginResponse.data.user || { email: formData.email }, loginResponse.data.access_token);
          
          setTimeout(() => {
            navigate('/profile-setup');
          }, 1000);
        } else {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        setSuccess('Account created! Please login with your credentials.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error) {
      console.error('Signup error:', error);
      
      if (error.response?.status === 400) {
        setError('User with this email already exists');
      } else if (error.response?.status === 422) {
        setError('Please check your input format');
      } else {
        setError(error.response?.data?.detail || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
        maxWidth: '440px',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '2.5rem',
            marginBottom: '12px',
            fontWeight: '800',
            color: '#3d302d'
          }}>
            Join Synapso
          </h1>
          <p style={{ 
            color: 'rgba(61, 48, 45, 0.8)',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Find your perfect study partner
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <User size={20} style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '18px', 
              color: '#886355' 
            }} />
            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '18px 18px 18px 52px',
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
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(217, 192, 150, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(217, 192, 150, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <Mail size={20} style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '18px', 
              color: '#886355' 
            }} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '18px 18px 18px 52px',
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
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(217, 192, 150, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(217, 192, 150, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Lock size={20} style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '18px', 
              color: '#886355' 
            }} />
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '18px 18px 18px 52px',
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
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.borderColor = 'rgba(217, 192, 150, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(217, 192, 150, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            />
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

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(136, 99, 85, 0.3)'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 25px rgba(136, 99, 85, 0.4)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 20px rgba(136, 99, 85, 0.3)';
            }}
          >
            {loading ? 'Creating Account...' : (
              <>
                <UserPlus size={20} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p style={{ 
            color: 'rgba(61, 48, 45, 0.7)', 
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            Already have an account? 
            <Link to="/login" style={{ 
              color: '#3d302d', 
              textDecoration: 'none', 
              marginLeft: '6px',
              fontWeight: '700',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#886355'}
            onMouseOut={(e) => e.target.style.color = '#3d302d'}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
