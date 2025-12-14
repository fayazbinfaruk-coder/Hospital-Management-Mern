import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); 

      const userRole = res.data.user.role;


      if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'doctor') {
        navigate('/dashboard/doctor');
      } else if (userRole === 'donor') {
        navigate('/dashboard/donor');
      } else if (userRole === 'ambulance_driver') {
        navigate('/dashboard/driver');
      } else {
        navigate('/dashboard/patient'); 
      }
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section>
      <div className="container">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">Login to Your Account</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded-md"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 mb-4 border rounded-md"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button type="submit" className="btn w-full mb-4">Login</button>

            <p className="text-sm text-blue-500 hover:underline mb-4 cursor-pointer" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </p>
            <p className="text-sm text-gray-600 mb-5">Don’t have an account?</p>

            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full py-3 px-6 rounded-[50px] font-semibold bg-green-500 text-white hover:bg-green-600 transition duration-300"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
