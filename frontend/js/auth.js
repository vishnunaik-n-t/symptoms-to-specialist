const loginTab = document.getElementById("login-tab");
const registerTab = document.getElementById("register-tab");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

// Tab switching
loginTab.onclick = () => {
  loginForm.style.display = "block";
  registerForm.style.display = "none";
};

registerTab.onclick = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
};

// Login Form Submit
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch("http://localhost:5000/api/patients/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "./patient/dashboard.html";
  } else {
    alert(data.message || "Login failed");
  }
};

// Register Form Submit
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const age = document.getElementById("register-age").value;
    const gender = document.getElementById("register-gender").value;
  
    const res = await fetch("http://localhost:5000/api/patients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, age, gender }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert("Registration successful. Please login.");
      loginTab.click(); // switch to login tab
    } else {
      alert(data.message || "Registration failed");
    }
  };
  