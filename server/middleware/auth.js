const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

function requireAuth(req, res, next) {
  const token = req.cookies.session_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    req.user = jwt.verify(token, SECRET); // { userId, email, isAdmin }
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { requireAuth };