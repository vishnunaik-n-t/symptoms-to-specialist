async function loginDoctor() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = '';

    if (!email || !password) {
      errorDiv.textContent = 'Please enter email and password.';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/doctor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        errorDiv.textContent = data.message || 'Login failed';
      } else {
        localStorage.setItem('doctorToken', data.token);
        localStorage.setItem('doctorName', data.doctor.name); // optional use in dashboard
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      console.error(err);
      errorDiv.textContent = 'Server error. Please try again later.';
    }
  }