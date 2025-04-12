const token = localStorage.getItem("token");
if (!token) {
  alert("Please login first");
  window.location.href = "../patient-auth.html";
}

const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const ageField = document.getElementById("age");
const genderField = document.getElementById("gender");

window.onload = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/patients/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      nameField.value = data.name;
      emailField.value = data.email;
      ageField.value = data.age;
      genderField.value = data.gender;
    } else {
      throw new Error("Could not fetch profile");
    }
  } catch (err) {
    alert("Error loading profile. Please login again.");
    localStorage.removeItem("token");
    window.location.href = "../patient-auth.html";
  }
};

document.getElementById("profile-form").onsubmit = async (e) => {
  e.preventDefault();

  const updatedData = {
    name: nameField.value,
    age: ageField.value,
    gender: genderField.value,
  };

  const res = await fetch("http://localhost:5000/api/patients/update-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Profile updated successfully!");
  } else {
    alert(data.message || "Update failed");
  }
};

function goBack() {
  window.location.href = "./dashboard.html";
}
