const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const authDoctor = require('../middleware/authDoctor');
const Appointment = require('../models/Appointment');


const router = express.Router();

// @route   POST /api/doctor/register
// @desc    Register a new doctor
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, specialist, experience, availability } = req.body;

        // Check if doctor already exists
        let doctor = await Doctor.findOne({ email });
        if (doctor) return res.status(400).json({ message: 'Doctor already exists' });

        // Create new doctor
        doctor = new Doctor({ name, email, password, specialist, experience, availability });
        await doctor.save();

        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/doctor/login
// @desc    Authenticate doctor & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const doctor = await Doctor.findOne({ email });

        if (!doctor) return res.status(400).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, doctor: { doctorId: doctor._id, name: doctor.name, specialist: doctor.specialist } });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/profile', authDoctor, async (req, res) => {
    try {
      const doctor = await Doctor.findById(req.user.doctorId).select('-password');
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
  
      res.json(doctor);
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });



  router.get('/view-appointments', authDoctor, async (req, res) => {
    try {
      const doctorId = req.user.doctorId;
  
      // Fetch all appointments for the doctor
      const appointments = await Appointment.find({ doctorId: doctorId })
        .populate('patientId', 'name age gender')
        .sort({ date: 1 }); // Sort by appointment date ascending
  
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of the day
  
      const oldAppointments = [];
      const newAppointments = [];
  
      appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0); // Normalize too
  
        if (appointmentDate < today) {
          oldAppointments.push(appointment);
        } else {
          newAppointments.push(appointment);
        }
      });
  
      res.status(200).json({ oldAppointments, newAppointments });
    } catch (error) {
      console.error('Error in /doctor/view-appointments:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  


  router.put('/update-status/:appointmentId', authDoctor, async (req, res) => {
    try {
        const doctorId = req.user.doctorId;
        const { appointmentId } = req.params;
        const { status, newDate, newTime } = req.body;

        const validStatuses = ['Accepted', 'Rescheduled', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find appointment and make sure this doctor owns it
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctorId.toString() !== doctorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized: You can only update your own appointments' });
        }

        // If rescheduling, check for new date/time
        if (status === 'Rescheduled') {
            if (!newDate || !newTime) {
                return res.status(400).json({ message: 'New date and time are required for rescheduling' });
            }
            appointment.date = new Date(newDate);
            appointment.time = newTime;
        }

        // Update status
        appointment.status = status;
        await appointment.save();

        res.status(200).json({ message: 'Appointment status updated', appointment });
    } catch (error) {
        console.error('Error in update-status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/prescribe/:appointmentId', authDoctor, async (req, res) => {
    try {
        const doctorId = req.user.doctorId;
        const { appointmentId } = req.params;
        const { medicines, notes } = req.body;

        if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
            return res.status(400).json({ message: 'At least one medicine must be provided' });
        }

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.doctorId.toString() !== doctorId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to prescribe for this appointment' });
        }

        appointment.prescription = {
            medicines,
            notes,
            prescribedAt: new Date()
        };

        await appointment.save();
        res.status(200).json({ message: 'Prescription added successfully', prescription: appointment.prescription });
    } catch (error) {
        console.error('Error in prescribe endpoint:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-availability', authDoctor, async (req, res) => {
    try {
      const { availability } = req.body;
  
      if (typeof availability !== 'boolean') {
        return res.status(400).json({ message: 'Invalid availability value' });
      }
  
      const updatedDoctor = await Doctor.findByIdAndUpdate(
        req.user.doctorId,
        { availability },
        { new: true }
      );
  
      res.json({ message: 'Availability updated successfully' });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


module.exports = router;