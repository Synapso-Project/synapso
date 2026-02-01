import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit3, Save, X, LogOut, BookOpen, Clock, Brain, Heart } from 'lucide-react';
import axios from 'axios';
import {
  SUBJECT_OPTIONS, AVAILABILITY_OPTIONS, STUDY_HABIT_OPTIONS,
  INTEREST_OPTIONS, STUDY_STYLE_OPTIONS, STUDY_LOCATION_OPTIONS, ACADEMIC_LEVEL_OPTIONS
} from '../constants/profileOptions'; // update this path

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState({});
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://https://synapso-app.onrender.com/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setEditData({
        subjects: response.data.subjects || [],
        availability: response.data.availability || [],
        bio: response.data.bio || '',
        studyHabits: response.data.study_habits || [],
        interests: response.data.interests || [],
        studyStyle: response.data.study_style || '',
        preferredStudyTime: response.data.preferred_study_time || '',
        studyLocation: response.data.study_location || '',
        academicLevel: response.data.academic_level || '',
        goals: (response.data.goals || []).join(', '),
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const updateData = {
        subjects: editData.subjects,
        availability: editData.availability,
        bio: editData.bio,
        study_habits: editData.studyHabits,
        interests: editData.interests,
        study_style: editData.studyStyle,
        preferred_study_time: editData.preferredStudyTime,
        study_location: editData.studyLocation,
        academic_level: editData.academicLevel,
        goals: editData.goals.split(',').map(g => g.trim()).filter(g => g),
      };
      
  
      await axios.put('http://https://synapso-app.onrender.com/users/profile', updateData, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

  
      await fetchProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  

  const toggleChip = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !profile) return <div>Loading...</div>;

  // Helper for rendering suggestion chips (multi-select)
  const renderChips = (options, field) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggleChip(field, opt)}
          style={{
            background: editData[field]?.includes(opt) ? 'linear-gradient(135deg, #b59175, #886355)' : 'rgba(255,255,255,0.25)',
            color: editData[field]?.includes(opt) ? 'white' : '#3d302d',
            border: editData[field]?.includes(opt)
              ? '1.5px solid #886355' : '1px solid #ccc',
            borderRadius: 14,
            padding: '6px 16px',
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 4,
            cursor: 'pointer',
            minWidth: 80,
            boxShadow: editData[field]?.includes(opt) ? '0 2px 10px rgba(136, 99, 85, 0.16)' : 'none'
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
 

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      background: 'linear-gradient(135deg, #d9c096 0%, #b59175 30%, #886355 70%, #3d302d 100%)',
      padding: '30px 20px'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        borderRadius: 24,
        padding: 40,
        maxWidth: 700,
        margin: '0 auto',
        boxShadow: '0 8px 32px 0 rgba(31,38,135,0.2)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 35, paddingBottom: 30, borderBottom: '2px solid #e4d4c6' }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'linear-gradient(135deg, #b59175, #886355)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2.5rem', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(136,99,85,0.4)', flexShrink: 0
          }}>
            <User size={48} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, color: '#3d302d', fontSize: '2rem', fontWeight: 800 }}>{profile.username || 'User'}</h1>
            <p style={{ margin: 0, color: 'rgba(61,48,45,0.7)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mail size={16} />{profile.email || 'user@example.com'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={editing ? handleSave : () => setEditing(true)}
              style={{
                background: editing ? 'linear-gradient(135deg, #b59175, #886355)' : 'rgba(181,145,117,0.25)',
                color: editing ? 'white' : '#3d302d',
                border: editing ? '1px solid #886355' : '1px solid #b59175',
                padding: 12, borderRadius: 12, cursor: 'pointer', fontWeight: 600,
                boxShadow: editing ? '0 4px 15px rgba(136,99,85,0.3)' : 'none'
              }}>
              {editing ? <Save size={20} /> : <Edit3 size={20} />}
            </button>
            {editing && (
              <button onClick={() => setEditing(false)}
                style={{
                  background: 'rgba(239,68,68,0.2)', color: '#e53e3e', border: '1px solid rgba(239,68,68,0.3)',
                  padding: 12, borderRadius: 12, cursor: 'pointer'
                }}>
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Main info blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
          {/* Bio */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Bio</strong>
            {editing ? (
              <>
                <textarea value={editData.bio}
                  onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))}
                  placeholder="Tell us about yourself. E.g. 'I'm a CS student who loves solving problems and making friends!'" rows={3}
                  maxLength={200}
                  style={{ width: '100%', padding: 14, borderRadius: 12, border: '1px solid #b59175', fontSize: 15, marginTop: 5 }}
                />
                <div style={{ color: '#888', fontSize: 13 }}>{editData.bio?.length}/200 characters</div>
              </>
            ) : <div style={{ color: '#3d302d', fontSize: 15, margin: '8px 0 0 0' }}>{profile.bio || <span style={{ color: '#a0a0a0' }}>No bio added</span>}</div>}
          </section>

          {/* Subjects */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d302d', fontWeight: 700, fontSize: 17 }}>
              <BookOpen size={20} />
              Subjects
            </div>
            {editing ? renderChips(SUBJECT_OPTIONS, 'subjects') : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {profile.subjects && profile.subjects.length > 0
                  ? profile.subjects.map((s, i) => <span key={i} style={{ background: 'linear-gradient(135deg, #d9c096, #b59175)', color: '#3d302d', padding: '8px 14px', borderRadius: 12, fontWeight: 600 }}>{s}</span>)
                  : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No subjects added yet</span>}
              </div>
            )}
          </section>

          {/* Availability */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d302d', fontWeight: 700, fontSize: 17 }}>
              <Clock size={20} />
              Availability
            </div>
            {editing ? renderChips(AVAILABILITY_OPTIONS, 'availability') : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {profile.availability && profile.availability.length > 0
                  ? profile.availability.map((t, i) => <span key={i} style={{ background: 'rgba(136,99,85,0.15)', padding: '8px 14px', borderRadius: 12, color: '#3d302d' }}>{t}</span>)
                  : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No availability set yet</span>}
              </div>
            )}
          </section>

          {/* Study Habits */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d302d', fontWeight: 700, fontSize: 17 }}>
              <Brain size={20} />
              Study Habits
            </div>
            {editing ? renderChips(STUDY_HABIT_OPTIONS, 'studyHabits') : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {profile.study_habits?.length > 0
                  ? profile.study_habits.map((h, i) => <span key={i} style={{ background: 'rgba(136,99,85,0.15)', padding: '8px 14px', borderRadius: 12, color: '#3d302d' }}>{h}</span>)
                  : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No study habits set yet</span>}
              </div>
            )}
          </section>

          {/* Interests */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3d302d', fontWeight: 700, fontSize: 17 }}>
              <Heart size={20} />
              Interests
            </div>
            {editing ? renderChips(INTEREST_OPTIONS, 'interests') : (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
                {profile.interests?.length > 0
                  ? profile.interests.map((h, i) => <span key={i} style={{ background: 'rgba(136,99,85,0.13)', padding: '8px 14px', borderRadius: 12, color: '#3d302d' }}>{h}</span>)
                  : <span style={{ color: '#aaa', fontStyle: 'italic' }}>No interests set yet</span>}
              </div>
            )}
          </section>

          {/* Study Style */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Study Style</strong>
            {editing ? (
              <select value={editData.studyStyle} style={{ width: '100%', padding: 10, borderRadius: 11, marginTop: 7 }}
                onChange={e => setEditData(d => ({ ...d, studyStyle: e.target.value }))} >
                <option value="">Select...</option>
                {STUDY_STYLE_OPTIONS.map(opt => <option value={opt} key={opt}>{opt}</option>)}
              </select>
            ) : <div style={{ color: '#3d302d', marginTop: 7 }}>{profile.study_style || <span style={{ color: '#aaa' }}>Not set</span>}</div>}
          </section>

          {/* Preferred Study Time */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Preferred Study Time</strong>
            {editing ? (
              <input value={editData.preferredStudyTime}
                onChange={e => setEditData(d => ({ ...d, preferredStudyTime: e.target.value }))}
                placeholder="E.g. Morning" style={{ width: '100%', padding: 10, borderRadius: 11, marginTop: 7 }} />
            ) : <div style={{ color: '#3d302d', marginTop: 7 }}>{profile.preferred_study_time || <span style={{ color: '#aaa' }}>Not set</span>}</div>}
          </section>

          {/* Study Location */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Study Location</strong>
            {editing ? (
              <select value={editData.studyLocation} style={{ width: '100%', padding: 10, borderRadius: 11, marginTop: 7 }}
                onChange={e => setEditData(d => ({ ...d, studyLocation: e.target.value }))} >
                <option value="">Select...</option>
                {STUDY_LOCATION_OPTIONS.map(opt => <option value={opt} key={opt}>{opt}</option>)}
              </select>
            ) : <div style={{ color: '#3d302d', marginTop: 7 }}>{profile.study_location || <span style={{ color: '#aaa' }}>Not set</span>}</div>}
          </section>

          {/* Academic Level */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Academic Level</strong>
            {editing ? (
              <select value={editData.academicLevel} style={{ width: '100%', padding: 10, borderRadius: 11, marginTop: 7 }}
                onChange={e => setEditData(d => ({ ...d, academicLevel: e.target.value }))} >
                <option value="">Select...</option>
                {ACADEMIC_LEVEL_OPTIONS.map(opt => <option value={opt} key={opt}>{opt}</option>)}
              </select>
            ) : <div style={{ color: '#3d302d', marginTop: 7 }}>{profile.academic_level || <span style={{ color: '#aaa' }}>Not set</span>}</div>}
          </section>

          {/* Goals */}
          <section>
            <strong style={{ color: '#3d302d', fontSize: 17 }}>Goals</strong>
            {editing ? (
              <>
                <textarea value={editData.goals}
                  onChange={e => setEditData(d => ({ ...d, goals: e.target.value }))}
                  placeholder="Pass exams, improve grades, learn new skills..."
                  rows={2} style={{ width: '100%', padding: 12, borderRadius: 11, marginTop: 6 }}
                  maxLength={150}
                />
                <div style={{ color: '#888', fontSize: 13 }}>Separate multiple goals with commas</div>
              </>
            ) : (
              <div style={{ color: '#3d302d', marginTop: 7 }}>
                {profile.goals && profile.goals.length > 0
                  ? profile.goals.join(', ')
                  : <span style={{ color: '#aaa' }}>No goals set yet</span>}
              </div>
            )}
          </section>
        </div>

        <div style={{ marginTop: 35, paddingTop: 30, borderTop: '2px solid #e4d4c6' }}>
          <button onClick={handleLogout}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #886355, #3d302d)', color: 'white',
              border: 'none', padding: 16, borderRadius: 14, fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s',
              boxShadow: '0 4px 20px rgba(136,99,85,0.3)', fontSize: '1.05rem'
            }}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
