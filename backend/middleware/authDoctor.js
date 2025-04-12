const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');

const authDoctor = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

    // Check if this token actually belongs to a Doctor
    const doctor = await Doctor.findById(decoded.doctorId);
    if (!doctor) {
      return res.status(401).json({ message: 'Invalid token. Doctor not found.' });
    }

    req.user = { doctorId: doctor._id }; // or you can attach full doctor if needed
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authDoctor;
