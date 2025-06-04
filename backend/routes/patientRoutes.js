const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Patient = require('../models/Patient');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

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

// router.post('/send-otp', async (req, res) => {
//   const { email } = req.body;
//   const user = await Patient.findOne({ email });
//   if (!user) return res.status(404).json({ message: 'User not found' });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

//   user.otp = otp;
//   user.otpExpires = otpExpires;
//   await user.save();

//   // Use Nodemailer to send email
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'ntvishnunaik@gmail.com',
//       pass: process.env.PASS // Use App Password if Gmail
//     }
//   });

//   const mailOptions = {
//     from: 'ntvishnunaik@gmail.com',
//     to: email,
//     subject: 'Your OTP for Password Reset',
//     text: `Your OTP is ${otp}. It is valid for 10 minutes.`
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     res.json({ message: 'OTP sent successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to send OTP', error: err.message });
//   }
// });


// router.post('/reset-password', async (req, res) => {
//   const { email, otp, newPassword } = req.body;

//   const user = await Patient.findOne({ email });
//   if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
//     return res.status(400).json({ message: 'Invalid or expired OTP' });
//   }

//   const hashedPassword = await bcrypt.hash(newPassword, 10);
//   user.password = hashedPassword;
//   user.otp = null;
//   user.otpExpires = null;
//   await user.save();

//   res.json({ message: 'Password reset successful' });
// });

module.exports = router;