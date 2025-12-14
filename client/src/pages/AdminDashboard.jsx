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

  return (
    <div className="container">
      <h2 className="heading mt-[30px]">Welcome, Admin</h2>
      <p className="text_para mb-4">This is your dashboard.</p>

      <div className="mb-4">
        <label htmlFor="role" className="mr-2 font-semibold">
          Filter by Role:
        </label>
        <select
          id="role"
          value={filteredRole}
          onChange={(e) => setFilteredRole(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="all">All</option>
          <option value="doctor">Doctor</option>
          <option value="donor">Donor</option>
          <option value="ambulance_driver">Ambulance Driver</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Verified</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border capitalize">{user.role}</td>
                  <td className="p-2 border">{user.phone || 'N/A'}</td>
                  <td className="p-2 border">
                    {user.is_verified || user.role === 'patient' ? '✅' : '❌'}
                  </td>
                  <td className="p-2 border space-x-2">
                    {user.role !== 'patient' && !user.is_verified && (
                      <button
                        onClick={() => handleVerify(user._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
