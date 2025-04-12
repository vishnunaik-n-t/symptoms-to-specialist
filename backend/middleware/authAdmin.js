const jwt = require('jsonwebtoken');

const authAdmin = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) return res.status(401).json({ message: 'Access Denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    res.status(400).json({ message: 'Invalid Token' });
  }
};

module.exports = authAdmin;
