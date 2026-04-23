import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  const fallbackUser = JSON.parse(localStorage.getItem('user') || 'null');
  const activeUser = user || fallbackUser;

  if (!activeUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRole && activeUser.role !== allowedRole) {
    return <Navigate to={`/${activeUser.role}/overview`} replace />;
  }

  return children;
};

export default ProtectedRoute;
