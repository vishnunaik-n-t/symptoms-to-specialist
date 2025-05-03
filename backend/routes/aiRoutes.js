const express = require('express');
const axios = require('axios');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Predict Specialists & Fetch Best-Matching Available Doctors
router.post('/predict-specialist', authMiddleware, async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: 'Invalid symptoms input' });
        }

        // Step 1: Get top specialist predictions with confidence
        const aiResponse = await axios.post('http://127.0.0.1:5001/predict-specialist', { symptoms });
        const { top_specialists } = aiResponse.data;

        if (!top_specialists || top_specialists.length === 0) {
            return res.status(404).json({ message: 'No specialists predicted' });
        }

        let allDoctors = [];

        // Step 2: For each top predicted specialist, get available doctors
        for (const specialistObj of top_specialists) {
            const { specialist, confidence } = specialistObj;

            const doctors = await Doctor.find({ specialist, availability: true }).select('-password');

            // Step 3: Attach confidence score to each doctor
            const doctorsWithMatch = doctors.map(doc => ({
                doctorId: doc._id,
                name: doc.name,
                specialist: doc.specialist,
                experience: doc.experience,
                match: confidence  // predicted match %
            }));

            allDoctors = allDoctors.concat(doctorsWithMatch);
        }

        if (allDoctors.length === 0) {
            return res.status(404).json({ message: 'No available doctors found' });
        }

        // Step 4: Sort by match %, take top 5
        allDoctors.sort((a, b) => b.match - a.match);
        const topDoctors = allDoctors.slice(0, 5);

        res.status(200).json(topDoctors);

    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
});

module.exports = router;
