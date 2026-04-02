var express = require('express');
var router = express.Router();
const User = require('../models/User');

const sendSuccess = (res, data, message = 'OK', status = 200) => {
    return res.status(status).json({ success: true, data, message });
};

const sendError = (res, message = 'Request failed', status = 500, data = null) => {
    return res.status(status).json({ success: false, data, message });
};

router.get('/api/loadUsers', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return sendSuccess(res, users, 'Users fetched successfully');
  } catch (error) {
    console.error('Error fetching users:', error);
    return sendError(res, 'Failed to fetch users');
  }
});

router.delete('/api/deleteUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        const deletedUser = await User.findOneAndDelete({ userId: userId });

        if (!deletedUser) {
            return sendError(res, 'User not found', 404);
        }

        return sendSuccess(res, deletedUser, 'User deleted successfully');
    } catch (error) {
        console.error('Error deleting user:', error);
        return sendError(res, 'Internal server error');
    }
});

module.exports = router;
