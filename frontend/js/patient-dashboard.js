window.onload = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first");
      window.location.href = "../patient-auth.html";
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/api/patients/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (res.ok) {
        document.getElementById("patient-name").innerText = data.name;
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (err) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "../patient-auth.html";
    }
  };
  
  function logout() {
    localStorage.removeItem("token");
    window.location.href = "../patient-auth.html";
  }
  
  function goTo(page) {
    if (page === "profile") window.location.href = "./profile.html";
    if (page === "book") window.location.href = "./book-appointment.html";
    if (page === "appointments") window.location.href = "./my-appointments.html";
  }
  