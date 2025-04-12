const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    specialist: { type: String, required: true },
    symptoms: { type: [String], required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // New field for time selection
    status: { type: String, enum: ['Pending', 'Accepted', 'Rescheduled', 'Cancelled'], default: 'Pending' },
    prescription: {
        medicines: [String],
        notes: String,
        prescribedAt: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
