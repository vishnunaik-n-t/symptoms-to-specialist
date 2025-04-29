const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const aiRoutes = require('./routes/aiRoutes');
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const configRoutes = require('./routes/configRoutes');
dotenv.config(); // Load environment variables
connectDB(); // Connect to MongoDB



const app = express();
app.use(express.json());
 
app.use(cors()); // Enable CORS


app.use("/api/patients", patientRoutes);
app.use('/api/ai', aiRoutes);  
app.use('/api/appointment', appointmentRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);



 

// Sample Route
app.get("/", (req, res) => {
  res.send("Symptom to Specialist API is running...");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
