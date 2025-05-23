const express = require('express');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Book Appointment Route
router.post('/book-appointment', authMiddleware, async (req, res) => {
    try {
        const { doctorId, symptoms, date, time } = req.body;
        const patientId = req.user.id; // Extract from JWT token

        // Validate input
        if (!doctorId || !symptoms || symptoms.length === 0 || !date || !time) {
            return res.status(400).json({ message: 'All fields are required (doctorId, symptoms, date, time)' });
        }

        const appointmentDate = new Date(date);
        const today = new Date();
        const dateOnly = new Date(today.toISOString().split('T')[0] + 'T00:00:00.000Z');
        if (appointmentDate < dateOnly) {
            return res.status(400).json({ message: 'Appointment date must be in the future...' });
        }
        // For same-day appointment, check time
        if (appointmentDate.toDateString() === today.toDateString()) {
            // Parse time (expects format like "3:30 PM")
            const [timeString, modifier] = time.split(' ');
            let [hours, minutes] = timeString.split(':').map(Number);

            if (modifier.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12;
            }
            if (modifier.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }

            const inputDateTime = new Date(appointmentDate);
            inputDateTime.setHours(hours, minutes, 0, 0);

            if (inputDateTime < today) {
                return res.status(400).json({ message: 'Appointment time must be in the future for today' });
            }
        }

        // Check if doctor exists & is available
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        if (!doctor.availability) {
            return res.status(400).json({ message: 'Selected doctor is currently unavailable' });
        }

        // Create new appointment with time field
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            specialist: doctor.specialist,
            symptoms,
            date: appointmentDate,
            time,  
            status: 'Pending'
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (error) {
        console.error("Appointment Booking Error:", error);
        // console.log("Appointment Booking Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/my-appointments', authMiddleware, async (req, res) => {
    try {
        const patientId = req.user.id; // Extract patient ID from JWT

        // Fetch all appointments for the patient
        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'name specialist') // Fetch doctor details (name, specialist)
            .sort({ date: 1, time: 1 }); // Sort by upcoming date & time

        if (!appointments.length) {
            return res.status(404).json({ message: 'No appointments found' });
        }

        // Separate upcoming and past appointments
        const today = new Date();
        const dateOnly = new Date(today.toISOString().split('T')[0] + 'T00:00:00.000Z');
        const upcomingAppointments = appointments.filter(appt => new Date(appt.date) >= dateOnly);
        const pastAppointments = appointments.filter(appt => new Date(appt.date) < dateOnly);

        res.status(200).json({
            upcomingAppointments,
            pastAppointments
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.delete('/cancel-appointment/:id', authMiddleware, async (req, res) => {
    try {
        const patientId = req.user.id; // Extract patient ID from JWT
        const appointmentId = req.params.id;

        // Find the appointment
        const appointment = await Appointment.findOne({ _id: appointmentId, patientId });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found or unauthorized' });
        }

        // Check if appointment date is in the past
        const appointmentDate = new Date(appointment.date);
        const now = new Date();
        const dateOnly = new Date(now.toISOString().split('T')[0] + 'T00:00:00.000Z');
        if (appointmentDate < dateOnly) {
            return res.status(400).json({ message: 'Cannot cancel past appointments' });
        }

        // Delete the appointment
        await Appointment.findByIdAndDelete(appointmentId);

        res.status(200).json({ message: 'Appointment canceled successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
