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
  
      div.innerHTML = `
        <p><strong>Doctor:</strong> ${appt.doctorId?.name || 'Unknown'} (${appt.doctorId?.specialist})</p>
        <p><strong>Date:</strong> ${new Date(appt.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${appt.time}</p>
        <p><strong>Status:</strong> ${appt.status}</p>
        <p><strong>Prescription:</strong> ${appt.prescription.medicines}</p>
        <p><strong>Note:</strong> ${appt.prescription.notes}</p>
      `;
  
      // Add Cancel Button for upcoming only
      if (!isPast && appt.status !== "cancelled" && appt.status !== "Accepted") {
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel Appointment';
        cancelBtn.className = 'cancel-btn';
        cancelBtn.onclick = () => cancelAppointment(appt._id, div);
        div.appendChild(cancelBtn);
      }
  
      container.appendChild(div);
    });
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
  window.onload = loadAppointments;
  