const doctorName = localStorage.getItem('doctorName');
const token = localStorage.getItem('doctorToken');

if (!token) {
  alert('Unauthorized. Please login again.');
  window.location.href = 'login.html';
}

document.getElementById('doctorName').textContent = doctorName || 'Doctor';

async function getAvailability() {
  try {
    const res = await fetch('http://localhost:5000/api/doctor/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('availabilityText').textContent = data.availability ? 'Available' : 'Unavailable';
    } else {
      throw new Error(data.message);
    }
  } catch (err) {
    console.error(err);
    document.getElementById('availabilityText').textContent = 'Error';
  }
}

async function toggleAvailability() {
  const current = document.getElementById('availabilityText').textContent === 'Available';
  try {
    const res = await fetch('http://localhost:5000/api/doctor/update-availability', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ availability: !current })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('availabilityText').textContent = !current ? 'Available' : 'Unavailable';
    } else {
      alert(data.message || 'Failed to update availability');
    }
  } catch (err) {
    console.error(err);
    alert('Error updating availability');
  }
}

async function fetchAppointments() {
    try {
      const res = await fetch('http://localhost:5000/api/doctor/view-appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      const appointments = await res.json();
      const container = document.getElementById('appointmentsList');
      container.innerHTML = '';
  
      if (appointments.length === 0) {
        container.innerHTML = '<p>No appointments found.</p>';
        return;
      }
  
      appointments.forEach(appointment => {
        const { _id, date, time, symptoms, status, prescription, patientId } = appointment;
  
        const card = document.createElement('div');
        card.className = 'appointment-card';
  
        card.innerHTML = `
          <h4>Patient: ${patientId.name} (${patientId.gender}, ${patientId.age} yrs)</h4>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()} ${time}</p>
          <p><strong>Symptoms:</strong> ${symptoms.join(', ')}</p>
          <p><strong>Status:</strong> ${status}</p>
          ${prescription ? `
            <p><strong>Medicines:</strong> ${prescription.medicines.join(', ')}</p>
            ${prescription.notes ? `<p><strong>Notes:</strong> ${prescription.notes}</p>` : ''}
          ` : ''}
  
          <div class="card-actions">
            ${status !== 'Cancelled' ? `
              <select id="status-${_id}">
                <option value="">Change Status</option>
                <option value="Accepted">Accept</option>
                <option value="Rescheduled">Reschedule</option>
                <option value="Cancelled">Cancel</option>
              </select>
  
              <input type="date" id="newDate-${_id}" style="display:none;" />
              <input type="time" id="newTime-${_id}" style="display:none;" />
  
              <button class="btn toggle-btn" onclick="updateStatus('${_id}')">Update Status</button>
            ` : ''}
  
            <hr style="margin: 8px 0; width: 100%;">
            <input type="text" id="meds-${_id}" placeholder="Medicines (comma-separated)" />
            <textarea id="notes-${_id}" rows="2" placeholder="Notes (optional)"></textarea>
            <button class="btn" onclick="prescribe('${_id}')">Add Prescription</button>
          </div>
        `;
  
        // 👇 Fix: Use querySelector to find elements inside the card
        const statusSelect = card.querySelector(`#status-${_id}`);
        if (statusSelect) {
          statusSelect.addEventListener('change', (e) => {
            const show = e.target.value === 'Rescheduled';
            const dateInput = card.querySelector(`#newDate-${_id}`);
            const timeInput = card.querySelector(`#newTime-${_id}`);
            if (dateInput) dateInput.style.display = show ? 'inline-block' : 'none';
            if (timeInput) timeInput.style.display = show ? 'inline-block' : 'none';
          });
        }
  
        container.appendChild(card);
      });
    } catch (err) {
      console.error('Error fetching appointments:', err);
      document.getElementById('appointmentsList').innerHTML = '<p>Error loading appointments.</p>';
    }
  }
  
  
  async function updateStatus(appointmentId) {
    const status = document.getElementById(`status-${appointmentId}`).value;
    const newDate = document.getElementById(`newDate-${appointmentId}`).value;
    const newTime = document.getElementById(`newTime-${appointmentId}`).value;
  
    if (!status) {
      alert('Please select a status.');
      return;
    }
  
    const body = { status };
    if (status === 'Rescheduled') {
      if (!newDate || !newTime) {
        alert('Provide new date and time for rescheduling.');
        return;
      }
      body.newDate = newDate;
      body.newTime = newTime;
    }
  
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/update-status/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('Status updated');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Update status error:', err);
      alert('Server error');
    }
  }
  
  async function prescribe(appointmentId) {
    const meds = document.getElementById(`meds-${appointmentId}`).value.split(',').map(m => m.trim()).filter(Boolean);
    const notes = document.getElementById(`notes-${appointmentId}`).value;
  
    if (meds.length === 0) {
      alert('Enter at least one medicine.');
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/prescribe/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medicines: meds, notes })
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('Prescription added');
        fetchAppointments();
      } else {
        alert(data.message || 'Failed to add prescription');
      }
    } catch (err) {
      console.error('Prescription error:', err);
      alert('Server error');
    }
  }
  

function logout() {
  localStorage.removeItem('doctorToken');
  localStorage.removeItem('doctorName');
  window.location.href = 'login.html';
}

getAvailability();

fetchAppointments()
