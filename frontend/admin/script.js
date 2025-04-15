document.addEventListener('DOMContentLoaded', () => {
  const adminLoginForm = document.getElementById('adminLoginForm');

  if (!adminLoginForm) {
    console.error('Admin login form not found!');
    return;
  }

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = '';

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        errorMsg.textContent = data.message || 'Login failed';
        return;
      }

      localStorage.setItem('adminToken', data.token);
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error('Login Error:', err);
      errorMsg.textContent = 'Something went wrong. Try again.';
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
  
    if (!adminLoginForm) {
      console.error('Admin login form not found!');
      return;
    }
  
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const errorMsg = document.getElementById('errorMsg');
      errorMsg.textContent = '';
  
      try {
        const response = await fetch('http://localhost:5000/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          errorMsg.textContent = data.message || 'Login failed';
          return;
        }
  
        localStorage.setItem('adminToken', data.token);
        window.location.href = 'dashboard.html';
      } catch (err) {
        console.error('Login Error:', err);
        errorMsg.textContent = 'Something went wrong. Try again.';
      }
    });
  });
  