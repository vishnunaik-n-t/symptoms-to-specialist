
const symptoms = [
    "itching", "skin rash", "nodal skin eruptions", "continuous sneezing", "shivering", "chills", "joint pain",
    "stomach pain", "acidity", "ulcers on tongue", "muscle wasting", "vomiting", "burning micturition",
    "fatigue", "weight gain", "anxiety", "cold hands and feets", "mood swings", "weight loss", "restlessness",
    "lethargy", "patches in throat", "irregular sugar level", "cough", "high fever", "sunken eyes",
    "breathlessness", "sweating", "dehydration", "indigestion", "headache", "yellowish skin", "dark urine",
    "nausea", "loss of appetite", "pain behind the eyes", "back pain", "constipation", "abdominal pain", 
    "diarrhoea", "mild fever", "yellow urine", "yellowing of eyes", "acute liver failure", "fluid overload",
    "swelling of stomach", "swelled lymph nodes", "malaise", "blurred and distorted vision", "phlegm",
    "throat irritation", "redness of eyes", "sinus pressure", "runny nose", "congestion", "chest pain",
    "weakness in limbs", "fast heart rate", "pain during bowel movements", "pain in anal region", "bloody stool",
    "irritation in anus", "neck pain", "dizziness", "cramps", "bruising", "obesity", "swollen legs", 
    "swollen blood vessels", "puffy face and eyes", "enlarged thyroid", "brittle nails", "swollen extremeties",
    "excessive hunger", "extra marital contacts", "drying and tingling lips", "slurred speech", "knee pain",
    "hip joint pain", "muscle weakness", "stiff neck", "swelling joints", "movement stiffness", "spinning movements",
    "loss of balance", "unsteadiness", "weakness of one body side", "loss of smell", "bladder discomfort",
    "foul smell of urine", "continuous feel of urine", "passage of gases", "internal itching", 
    "toxic look (typhos)", "depression", "irritability", "muscle pain", "altered sensorium", "red spots over body",
    "belly pain", "abnormal menstruation", "dischromic  patches", "watering from eyes", "increased appetite",
    "polyuria", "family history", "mucoid sputum", "rusty sputum", "lack of concentration", "visual disturbances",
    "receiving blood transfusion", "receiving unsterile injections", "coma", "stomach bleeding",
    "distention of abdomen", "history of alcohol consumption", "fluid overload.1", "blood in sputum",
    "prominent veins on calf", "palpitations", "painful walking", "pus filled pimples", "blackheads", "scurring",
    "skin peeling", "silver like dusting", "small dents in nails", "inflammatory nails", "blister", 
    "red sore around nose", "yellow crust ooze"
  ];
  
  // Divide symptoms into common, moderate, rare (simple categorization)
  const commonSymptoms = symptoms.slice(0, 30);
  const moderateSymptoms = symptoms.slice(30, 70);
  const rareSymptoms = symptoms.slice(70);
  
  const selectedSymptoms = new Set();
  
  function populateDropdown(id, list) {
    const select = document.getElementById(id);
    list.forEach(symptom => {
      const opt = document.createElement('option');
      opt.value = symptom;
      opt.textContent = symptom;
      select.appendChild(opt);
    });
  
    select.addEventListener('change', () => {
      const value = select.value;
      if (value && !selectedSymptoms.has(value)) {
        selectedSymptoms.add(value);
        addSymptomTag(value);
      }
      select.value = '';
    });
  }
  
  function addSymptomTag(symptom) {
    const container = document.getElementById('selected-symptoms');
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `${symptom} <span>&times;</span>`;
  
    tag.querySelector('span').addEventListener('click', () => {
      selectedSymptoms.delete(symptom);
      container.removeChild(tag);
    });
  
    container.appendChild(tag);
  }
  
  async function predictDoctor() {
    if (selectedSymptoms.size === 0) {
      alert("Please select at least one symptom.");
      return;
    }
  
    const res = await fetch("http://localhost:5000/api/ai/predict-specialist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({ symptoms: Array.from(selectedSymptoms) })
    });

    if (!res.ok) {
        const text = await res.text();
        return alert("Prediction failed: " + text);
      }
  
    const doctors = await res.json();
    if (!Array.isArray(doctors) || doctors.length === 0) {
      return alert("No doctors available for the selected symptoms.");
    }
  
    const docSelect = document.getElementById("doctor-select");
    docSelect.innerHTML = `<option value="">-- Select --</option>`;
     
    doctors.forEach(doc => {
      const opt = document.createElement("option");
      opt.value = doc.doctorId;
      opt.textContent = `${doc.name} - ${doc.specialist} (${doc.experience} yrs) ->  ${doc.match.toFixed(1)}%`;
      docSelect.appendChild(opt);
    });
  }
  
  async function bookAppointment() {
    const doctorId = document.getElementById("doctor-select").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time-select").value;
  
    if (!doctorId || !date || !time) {
      alert("Please fill all fields");
      return;
    }
  
    const res = await fetch("http://localhost:5000/api/appointment/book-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token")
      },
      body: JSON.stringify({
        doctorId,
        symptoms: Array.from(selectedSymptoms),
        date,
        time
      })
    });
     
  
    const data = await res.json();
    if (res.ok) {
      alert("Appointment booked successfully!");
      window.location.href = "my-appointments.html";
    } else {
      alert(data.message || "Failed to book appointment");
    }
  }
  
  // On page load
  window.onload = () => {
    populateDropdown("symptom1", commonSymptoms);
    populateDropdown("symptom2", moderateSymptoms);
    populateDropdown("symptom3", rareSymptoms);
  
    document.getElementById("predict-btn").addEventListener("click", predictDoctor);
    document.getElementById("book-btn").addEventListener("click", bookAppointment);
  };
