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
      navigate('/account');
    } catch (err) {
      console.error('Registration failed:', err.response?.data || err.message || err);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <section>
      <div className="container">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">Create a New Account</h2>
          <form onSubmit={handleSubmit}>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Name"
              className="w-full p-3 mb-3 border rounded-md"
            />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="w-full p-3 mb-3 border rounded-md"
            />
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full p-3 mb-3 border rounded-md"
            />
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full p-3 mb-3 border rounded-md"
            />
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="w-full p-3 mb-3 border rounded-md"
            />

            {/* ✅ Blood type dropdown */}
            <select
              name="blood_type"
              value={formData.blood_type}
              onChange={handleChange}
              required
              className="w-full p-3 mb-3 border rounded-md"
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

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 mb-3 border rounded-md"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="donor">Blood Donor</option>
              <option value="ambulance_driver">Ambulance Driver</option>
            </select>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button type="submit" className="btn w-full">Sign Up</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Signup;
