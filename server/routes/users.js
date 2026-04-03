var express = require('express');
var router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

router.get('/api/loadUsers', requireAuth, async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/api/deleteUser/:userId', requireAuth, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findOneAndDelete({ userId: userId });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
