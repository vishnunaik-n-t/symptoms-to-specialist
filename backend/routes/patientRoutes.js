const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Register a new patient
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, age, gender } = req.body;
        
        // Check if email already exists
        let patient = await Patient.findOne({ email });
        if (patient) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        // Create new patient
        patient = new Patient({ name, email, password, age, gender });
        await patient.save();
        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login patient
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if patient exists
        const patient = await Patient.findOne({ email });
        if (!patient) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Compare password
        const isMatch = await bcrypt.compare(password, patient.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign({ id: patient._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, patient: { id: patient._id, name: patient.name, email: patient.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get patient profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
      const patient = await Patient.findById(req.user.id).select('-password');
      if (!patient) {
          return res.status(404).json({ message: 'Patient not found' });
      }
      res.json(patient);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update patient profile
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
      const { name, age, gender, medicalHistory } = req.body;
      
      const updatedPatient = await Patient.findByIdAndUpdate(
          req.user.id,
          { $set: { name, age, gender, medicalHistory } },
          { new: true, runValidators: true }
      ).select('-password');
      
      res.json(updatedPatient);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;