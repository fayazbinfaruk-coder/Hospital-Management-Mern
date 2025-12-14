import User from '../models/User.js';

// GET /api/admin/users/:role
export const getAllUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const validRoles = ['doctor', 'donor', 'patient', 'ambulance_driver'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users = await User.find({ role }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/admin/verify/:id
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.is_verified = true;
    await user.save();

    res.json({ message: `${user.role} verified successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/user/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: `${user.role} removed successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
