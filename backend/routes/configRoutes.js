// backend/routes/configRoutes.js
const express = require('express');
const router = express.Router();

router.get('/hospital-info', (req, res) => {
  const hospitalInfo = {
    name: process.env.HOSPITAL_NAME || "Default Hospital",
    address: process.env.HOSPITAL_ADDRESS || "Default Address"
  };
  res.json(hospitalInfo);
});

module.exports = router;
