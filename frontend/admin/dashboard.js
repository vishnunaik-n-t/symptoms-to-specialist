document.addEventListener('DOMContentLoaded', () => {
    // Protect dashboard
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      window.location.href = 'login.html';
    }
  
    // DOM references (Check if elements exist before proceeding)
    const addDoctorForm = document.getElementById('addDoctorForm');
    const doctorMessage = document.getElementById('addDoctorMsg');
    const doctorsTableBody = document.getElementById('doctorsTableBody');
    const addDoctorSection = document.getElementById('addDoctorSection');
    const viewDoctorsSection = document.getElementById('viewDoctorsSection');
    const showAddDoctorBtn = document.getElementById('showAddDoctorBtn');
    const showViewDoctorsBtn = document.getElementById('showViewDoctorsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
  
    // Check if necessary elements exist
    if (!addDoctorForm || !doctorMessage || !doctorsTableBody || !showAddDoctorBtn || !showViewDoctorsBtn || !logoutBtn) {
      console.error('One or more elements are missing from the DOM');
      return;
    }
  
    // Section toggling
    showAddDoctorBtn.addEventListener('click', () => {
      addDoctorSection.style.display = 'block';
      viewDoctorsSection.style.display = 'none';
    });
  
    showViewDoctorsBtn.addEventListener('click', () => {
      addDoctorSection.style.display = 'none';
      viewDoctorsSection.style.display = 'block';
      fetchDoctors(); // Refresh doctor list
    });
  
    // Logout
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('adminToken');
      window.location.href = 'login.html';
    });
  
    // Add doctor form submission
    addDoctorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const specialist = document.getElementById('specialist').value.trim();
      const experience = document.getElementById('experience').value.trim();
      const availability = document.getElementById('availability').value === 'true';
  
      try {
        const res = await fetch('http://localhost:5000/api/admin/add-doctor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
             Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ name, email, password, specialist, availability, experience })
        });
  
        const data = await res.json();
  
        if (!res.ok) {
          doctorMessage.textContent = data.message || 'Error adding doctor.';
        } else {
          doctorMessage.textContent = 'Doctor added successfully!';
          addDoctorForm.reset();
        }
      } catch (err) {
        console.error('Error adding doctor:', err);
        doctorMessage.textContent = 'Server error. Try again later.';
      }
    });
  
    // Fetch & display doctors
    async function fetchDoctors() {
      // Check if doctorsTableBody is valid
      if (!doctorsTableBody) {
        console.error('Doctors table body not found.');
        return;
      }
  
      doctorsTableBody.innerHTML = '';
  
      try {
        const res = await fetch('http://localhost:5000/api/admin/view-doctors', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
  
        const doctors = await res.json();
  
        doctors.forEach(doc => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${doc.name}</td>
            <td>${doc.email}</td>
            <td>${doc.specialist}</td>
            <td>${doc.availability ? 'Yes' : 'No'}</td>
            <td>${doc.experience} yrs</td>
            <td><button onclick="deleteDoctor('${doc._id}')">Delete</button></td>
          `;
          doctorsTableBody.appendChild(tr);
        });
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    }
  
    // Make fetchDoctors globally available if needed
    window.fetchDoctors = fetchDoctors;
  });
  
  // Make sure to have deleteDoctor outside the DOMContentLoaded block
  async function deleteDoctor(doctorId) {
    const adminToken = localStorage.getItem('adminToken');
    if (!confirm('Are you sure you want to delete this doctor?')) return;
  
    try {
      const res = await fetch(`http://localhost:5000/api/admin/remove-doctor/${doctorId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
  
      const data = await res.json();
  
      if (res.ok) {
        window.fetchDoctors(); // Refresh list
      } else {
        alert(data.message || 'Error deleting doctor.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Something went wrong.');
    }
  }
  