import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredRole, setFilteredRole] = useState('all');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const roles = ['doctor', 'donor', 'ambulance_driver', 'patient'];
        const allUsers = [];

        for (const role of roles) {
          const res = await axios.get(`/api/admin/users/${role}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allUsers.push(...res.data);
        }

        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleVerify = async (id) => {
    try {
      await axios.patch(`/api/admin/verify/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, is_verified: true } : user
        )
      );
    } catch (err) {
      console.error('Verification failed:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredUsers =
    filteredRole === 'all'
      ? users
      : users.filter((user) => user.role === filteredRole);

  const roleStats = {
    all: users.length,
    doctor: users.filter(u => u.role === 'doctor').length,
    donor: users.filter(u => u.role === 'donor').length,
    ambulance_driver: users.filter(u => u.role === 'ambulance_driver').length,
    patient: users.filter(u => u.role === 'patient').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primaryColor/5 via-white to-purpleColor/5 py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-headingColor mb-2">Admin Dashboard</h2>
          <p className="text-textColor">Manage users and monitor system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Users', value: roleStats.all, icon: '👥', color: 'from-primaryColor to-irisBlueColor' },
            { label: 'Doctors', value: roleStats.doctor, icon: '⚕️', color: 'from-purpleColor to-primaryColor' },
            { label: 'Donors', value: roleStats.donor, icon: '🩸', color: 'from-irisBlueColor to-primaryColor' },
            { label: 'Drivers', value: roleStats.ambulance_driver, icon: '🚑', color: 'from-yellowColor to-primaryColor' },
            { label: 'Patients', value: roleStats.patient, icon: '👤', color: 'from-primaryColor to-purpleColor' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-3xl font-bold text-headingColor mb-1">{stat.value}</p>
              <p className="text-sm text-textColor font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter and Table Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Filter Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-headingColor mb-1">User Management</h3>
                <p className="text-sm text-textColor">View and manage all registered users</p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="role" className="text-sm font-semibold text-headingColor">
                  Filter:
                </label>
                <select
                  id="role"
                  value={filteredRole}
                  onChange={(e) => setFilteredRole(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primaryColor focus:ring-2 focus:ring-primaryColor/20 outline-none transition-all bg-white font-medium"
                >
                  <option value="all">All Users</option>
                  <option value="doctor">Doctors</option>
                  <option value="donor">Donors</option>
                  <option value="ambulance_driver">Ambulance Drivers</option>
                  <option value="patient">Patients</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor mb-4"></div>
                  <p className="text-textColor">Loading users...</p>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-textColor">No users found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-primaryColor/10 to-purpleColor/10">
                      <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-headingColor">Phone</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-headingColor">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-headingColor">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primaryColor to-purpleColor flex items-center justify-center text-white font-semibold">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-headingColor">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-textColor">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-primaryColor/10 text-primaryColor capitalize">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-textColor">{user.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-center">
                          {user.is_verified || user.role === 'patient' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {user.role !== 'patient' && !user.is_verified && (
                              <button
                                onClick={() => handleVerify(user._id)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                              >
                                Verify
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-300 hover:shadow-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
