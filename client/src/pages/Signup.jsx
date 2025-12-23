import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient', // default
    phone: '',
    location: '',
    blood_type: ''
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
      const res = await axios.post('/api/users/register', formData);
      localStorage.setItem('token', res.data.token);
      
      // Trigger auth change event to update navbar
      window.dispatchEvent(new Event('authChange'));
      
      navigate('/account');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-irisBlueColor/10 via-white to-blue-50 py-12 px-4">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center gap-2 text-primaryColor hover:text-irisBlueColor font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
          
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-irisBlueColor to-primaryColor rounded-full mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-headingColor mb-2">Create Account</h2>
              <p className="text-textColor">Join our healthcare community today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-headingColor mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                />
              </div>

              {/* Phone & Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Phone Number</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1234567890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Location</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Blood Type & Role Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Blood Type</label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all bg-white"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-headingColor mb-2">Register As</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-irisBlueColor focus:ring-2 focus:ring-irisBlueColor/20 outline-none transition-all bg-white"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="donor">Blood Donor</option>
                    <option value="ambulance_driver">Ambulance Driver</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-irisBlueColor to-primaryColor text-white font-semibold py-3.5 rounded-xl hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Create Account
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-textColor text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-primaryColor font-semibold hover:text-irisBlueColor hover:underline transition-colors"
                  >
                    Login Here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
