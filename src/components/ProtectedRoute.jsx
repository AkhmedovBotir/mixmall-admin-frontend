import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children, permission }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');
  
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (permission && !permissions.includes(permission) && !permissions.includes('admin.*')) {
    return <Navigate to="/" />;
  }

  return children;
}
