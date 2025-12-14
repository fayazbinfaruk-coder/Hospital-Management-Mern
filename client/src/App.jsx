import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Account from './pages/Account';

import ForgotPassword from './pages/ForgetPassword';

import DoctorDashboard from './pages/dashboard/DoctorDashboard';


function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard/doctor" element={<DoctorDashboard />} />

      </Route>
    </Routes>
  );
}

export default App;
