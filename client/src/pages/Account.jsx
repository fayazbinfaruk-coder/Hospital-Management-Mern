import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Account = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    password: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          password: ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const res = await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err.response?.data?.message || err.message);
      alert('Update failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="container">
      <h2 className="heading mt-[30px]">Your Account</h2>

      {user ? (
        editMode ? (
          <form onSubmit={handleSubmit} className="text_para mt-5 flex flex-col gap-3">
            <div>
              <label><strong>Name:</strong></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label><strong>Phone:</strong></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label><strong>Location:</strong></label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} />
            </div>
            <div>
              <label><strong>Confirm Password:</strong></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn mt-3">Save Changes</button>
            <button type="button" className="btn mt-1" onClick={() => setEditMode(false)}>Cancel</button>
          </form>
        ) : (
          <div className="text_para mt-5">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Location:</strong> {user.location}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Verified:</strong> {user.is_verified ? 'Yes' : 'Pending'}</p>
            <button className="btn mt-3" onClick={() => setEditMode(true)}>Edit Profile</button>
          </div>
        )
      ) : (
        <p className="text_para mt-5">Loading profile...</p>
      )}
    </div>
  );
};

export default Account;
