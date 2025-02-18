import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = () => {
  // Retrieve token from localStorage
  const token = localStorage.getItem('token');

  // Check if token exists
  const isAuthenticated = !!token;

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoutes;
