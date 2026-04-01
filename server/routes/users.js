var express = require('express');
var router = express.Router();
const User = require('../models/User');

router.get('/api/loadUsers', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.delete('/api/deleteUser/:userId', async (req, res) => {
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
