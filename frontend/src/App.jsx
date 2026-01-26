import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SwipePage from './pages/SwipePage';
import MatchesPage from './pages/MatchesPage';
import ChatListPage from './pages/ChatListPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import PrivateRoute from './components/PrivateRoute';
import UserProfileView from './pages/UserProfileView';
import StudyRoomPage from './pages/StudyRoomPage';
import StudyRoomEntry from "./pages/StudyRoomEntry";

const AppLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/user/:userId" element={<UserProfileView />} />
          <Route path="/studyroom-entry" element={<StudyRoomEntry />} />
          <Route path="/studyroom/:roomId" element={<StudyRoomPage />} />

          {/* Private Routes - WITH HEADER */}
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
                <SwipePage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/swipe" element={
            <PrivateRoute>
              <AppLayout>
                <SwipePage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/matches" element={
            <PrivateRoute>
              <AppLayout>
                <MatchesPage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/chats" element={
            <PrivateRoute>
              <AppLayout>
                <ChatListPage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/chat/:matchId" element={
            <PrivateRoute>
              <AppLayout>
                <ChatPage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/profile-setup" element={
            <PrivateRoute>
              <AppLayout>
                <ProfileSetupPage />
              </AppLayout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
