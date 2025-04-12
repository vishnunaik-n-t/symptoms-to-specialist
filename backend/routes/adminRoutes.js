const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const verifyAdmin = require('../middleware/authAdmin');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/add-doctor', verifyAdmin, async (req, res) => {
  const { name, email, password, specialist, availability, experience } = req.body;

  try {
    const existing = await Doctor.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Doctor already exists' });

    const newDoctor = new Doctor({
      name,
      email,
      password,
      specialist,
      availability,
      experience
    });

    await newDoctor.save();
    res.status(201).json({ message: 'Doctor added successfully' });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/remove-doctor/:doctorId
router.delete('/remove-doctor/:doctorId', verifyAdmin, async (req, res) => {
  const doctorId = req.params.doctorId;

  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json({ message: 'Doctor removed successfully' });
  } catch (err) {
    console.error('Error removing doctor:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/admin/view-doctors
router.get('/view-doctors', verifyAdmin, async (req, res) => {
  try {
    const doctors = await Doctor.find().select('-password'); // exclude password
    res.status(200).json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;