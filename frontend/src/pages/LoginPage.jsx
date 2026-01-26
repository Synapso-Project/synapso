import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: 'alice@example.com',
    password: 'alicepwd'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

    try {
      const response = await axios.post('http://127.0.0.1:8000/users/login', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        login(response.data.user || { email: formData.email }, response.data.access_token);
        navigate('/swipe');
      } else {
        setError('No access token received');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 422) {
        setError('Invalid email or password format');
      } else if (error.response?.status === 401) {
        setError('Invalid credentials');
      } else {
        setError('Login failed. Please try again.');
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
            background: 'linear-gradient(135deg, #3d302d, #886355)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: 'rgba(61, 48, 45, 0.8)',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Sign in to continue to Synapso
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Mail size={20} style={{ 
              position: 'absolute', 
              left: '18px', 
              top: '18px', 
              color: '#886355' 
            }} />
            <input
              type="email"
              name="email"
              placeholder="Email"
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
              placeholder="Password"
              value={formData.password}
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

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              color: '#e53e3e',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '0.9rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: '500'
            }}>
              {error}
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
            {loading ? 'Signing in...' : (
              <>
                <LogIn size={20} />
                Sign In
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
            Don't have an account? 
            <Link to="/signup" style={{ 
              color: '#3d302d', 
              textDecoration: 'none', 
              marginLeft: '6px',
              fontWeight: '700',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#886355'}
            onMouseOut={(e) => e.target.style.color = '#3d302d'}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
