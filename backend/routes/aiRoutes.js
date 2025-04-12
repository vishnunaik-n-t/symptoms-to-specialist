const express = require('express');
const axios = require('axios');
const Doctor = require('../models/Doctor'); // Import Doctor model
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Predict Specialist & Fetch Available Doctors
router.post('/predict-specialist', authMiddleware, async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: 'Invalid symptoms input' });
        }

        // Step 1: Get Specialist Prediction from AI Model
        const aiResponse = await axios.post('http://127.0.0.1:5001/predict-specialist', { symptoms });
        const { specialist } = aiResponse.data;

        if (!specialist) {
            return res.status(404).json({ message: 'No matching specialist found' });
        }

        // Step 2: Fetch Available Doctors for the Predicted Specialist
        let availableDoctors = await Doctor.find({ specialist, availability: true }).select('-password');

        // Step 3: If no doctors are available, fetch General Physicians
        if (availableDoctors.length === 0) {
            availableDoctors = await Doctor.find({ specialist: "General Physician", availability: true }).select('-password');
        }

        // Step 4: If still no doctors available, return a message
        if (availableDoctors.length === 0) {
            return res.status(404).json({ message: 'No available doctors found' });
        }

        // Step 5: Return List of Available Doctors
        res.status(200).json(availableDoctors);

    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
});

module.exports = router;
