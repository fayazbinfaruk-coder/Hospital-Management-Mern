import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    name: '',
    newPassword: ''
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/users/verify-user', {
        email: formData.email,
        phone: formData.phone,
        name: formData.name
      });

      if (res.data.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/users/reset-password', {
        email: formData.email,
        newPassword: formData.newPassword
      });

      if (res.data.success) {
        setSuccess('Password reset successful. Please login.');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <section>
      <div className="container">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-6">
            {step === 1 ? 'Verify Your Identity' : 'Reset Your Password'}
          </h2>

          <form onSubmit={step === 1 ? handleVerify : handleReset}>
            {step === 1 ? (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 mb-3 border rounded-md"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full p-3 mb-3 border rounded-md"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 mb-3 border rounded-md"
                />
              </>
            ) : (
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full p-3 mb-3 border rounded-md"
              />
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

            <button type="submit" className="btn w-full">
              {step === 1 ? 'Verify Identity' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
