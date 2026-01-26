import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('access_token');

  // If no user or token, redirect to login
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children (protected page)
  return children;
};

export default PrivateRoute;
