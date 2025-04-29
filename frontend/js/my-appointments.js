let hospitalInfo = {
  name: "Default Hospital",
  address: "Default Address"
};

const token = localStorage.getItem("token");

async function fetchHospitalInfo() {
  try {
    const res = await fetch('http://localhost:5000/api/config/hospital-info');
    const data = await res.json();
    hospitalInfo = data;
  } catch (err) {
    console.error('Failed to fetch hospital info:', err);
  }
}

let patientName = 'Patient';  

async function fetchPatientProfile() {
  try {
    const res = await fetch("http://localhost:5000/api/patients/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      patientName = data.name;  
    } else {
      console.error('Failed to fetch patient profile');
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
}


async function loadAppointments() {
    try {
      const res = await fetch('http://localhost:5000/api/appointment/my-appointments', {
        headers: {
          Authorization: localStorage.getItem('token')
        }
      });
  
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load appointments");
        return;
      }
  
      renderAppointments('upcoming-appointments', data.upcomingAppointments);
      renderAppointments('past-appointments', data.pastAppointments, true);
    } catch (err) {
      console.error("Error loading appointments:", err);
      alert("Something went wrong while fetching appointments.");
    }
  }
  
  function renderAppointments(containerId, appointments, isPast = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
  
    if (!appointments.length) {
      container.innerHTML = '<p>No appointments found.</p>';
      return;
    }
  
    appointments.forEach(appt => {
      const div = document.createElement('div');
      div.className = 'appointment-card';
  
      const medicines = appt.prescription?.medicines?.join(', ') || 'N/A';
      const notes = appt.prescription?.notes || 'N/A';
  
      div.innerHTML = `
        <p><strong>Doctor:</strong> ${appt.doctorId?.name || 'Unknown'} (${appt.doctorId?.specialist})</p>
        <p><strong>Date:</strong> ${new Date(appt.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appt.time}</p>
        <p><strong>Status:</strong> ${appt.status}</p>
        <p><strong>Prescription:</strong> ${medicines}</p>
        <p><strong>Note:</strong> ${notes}</p>
      `;
  
      // Show cancel button for upcoming appointments
      if (!isPast && appt.status !== "cancelled" && appt.status !== "Accepted") {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Appointment';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.onclick = () => cancelAppointment(appt._id, div);
        div.appendChild(cancelBtn);
      }
  
      // Add Download PDF button for Accepted past appointments
      if (appt.status === "Accepted") {
        const pdfBtn = document.createElement('button');
        pdfBtn.textContent = 'Download PDF';
        pdfBtn.className = 'pdf-btn';
        pdfBtn.onclick = () => generatePDF(appt);
        div.appendChild(pdfBtn);
      }
  
      container.appendChild(div);
    });
  }

  async function generatePDF(appt) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set margins
  const marginLeft = 20;
  let currentY = 20;

  // Hospital Name - Big, Bold, Centered
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(hospitalInfo.name, doc.internal.pageSize.width / 2, currentY, { align: "center" });
  currentY += 10;

  // Hospital Address - Small, Centered
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(hospitalInfo.address, doc.internal.pageSize.width / 2, currentY, { align: "center" });
  currentY += 10;

  // Divider Line
  doc.setLineWidth(0.5);
  doc.line(marginLeft, currentY, doc.internal.pageSize.width - marginLeft, currentY);
  currentY += 10;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Appointment Confirmation", doc.internal.pageSize.width / 2, currentY, { align: "center" });
  currentY += 15;

  // Appointment Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  const details = [
    `Patient Name: ${patientName}`,
    `Doctor: ${appt.doctorId?.name || 'Unknown'} (${appt.doctorId?.specialist})`,
    `Date: ${new Date(appt.date).toLocaleDateString()}`,
    `Time: ${appt.time}`,
    `Status: ${appt.status}`,
    ``,
    `Prescription: ${appt.prescription?.medicines?.join(', ') || 'N/A'}`,
    `Notes: ${appt.prescription?.notes || 'N/A'}`
  ];

  details.forEach(line => {
    doc.text(line, marginLeft, currentY);
    currentY += 8;
  });

  // Save PDF
  doc.save(`Appointment_${appt._id}.pdf`);
}  

  
  async function cancelAppointment(appointmentId, cardElement) {
    const confirmCancel = confirm("Are you sure you want to cancel this appointment?");
    if (!confirmCancel) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/appointment/cancel-appointment/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token")
        }
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert("Appointment cancelled.");
        const statusParagraph = cardElement.querySelector("p:last-child");
        if (statusParagraph) {
          statusParagraph.innerHTML = "<strong>Status:</strong> cancelled";
        }
        cardElement.querySelector("button.cancel-btn")?.remove();
      } else {
        alert(data.message || "Failed to cancel appointment.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Something went wrong while cancelling....");
    }
  }
  
  
  // Load on page load
  window.onload = async () => {
    await fetchHospitalInfo();
    await fetchPatientProfile(); 
    await loadAppointments();
  };
  
  