/* ==========================================================
   1) REAL-TIME CLOCK
========================================================== */
function updateClock() {
    const now = new Date();
    document.getElementById("clock").innerText = now.toLocaleTimeString();
    document.getElementById("date").innerText = now.toLocaleDateString();
    document.getElementById("dayname").innerText = now.toLocaleDateString('en-US', { weekday: 'long' });
}
setInterval(updateClock, 1000);
updateClock();

/* ==========================================================
   2) TOP BAR DATE + TIME
========================================================== */
function updateTopInfo() {
    const now = new Date();
    document.getElementById("top-day").textContent = now.toLocaleDateString('en-US', { weekday: 'short' });
    document.getElementById("top-date").textContent = now.toLocaleDateString();
    document.getElementById("top-time").textContent = now.toLocaleTimeString();
}
setInterval(updateTopInfo, 1000);
updateTopInfo();

/* ==========================================================
   3) LOCATION + WEATHER (FAST + FIXED)
========================================================== */
function updateWeather(lat, lon) {
    const API = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(API)
        .then(res => res.json())
        .then(data => {
            document.getElementById("temperature").innerText = data.current_weather.temperature + "°C";
        })
        .catch(() => {
            document.getElementById("temperature").innerText = "N/A";
        });
}

function detectLocation() {
    if (!navigator.geolocation) {
        document.getElementById("top-location").innerText = "Location unavailable";
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        document.getElementById("top-location").innerText = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;

        updateWeather(lat, lon);
    }, () => {
        document.getElementById("top-location").innerText = "Denied";
    });
}
detectLocation();

/* ==========================================================
   4) WORLD MAP (Leaflet)
========================================================== */
let map = L.map('map').setView([20.5937, 78.9629], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

/* ==========================================================
   5) MEMORY GALLERY
========================================================== */
function loadGallery() {
    const grid = document.getElementById("gallery-grid");
    const saved = JSON.parse(localStorage.getItem("gallery") || "[]");
    grid.innerHTML = "";

    saved.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        img.onclick = () => openModal(src);
        grid.appendChild(img);
    });
}

function addGalleryImage() {
    const fileInput = document.getElementById("image-file");
    const file = fileInput.files[0];
    if (!file) return alert("Please select an image.");

    const reader = new FileReader();
    reader.onload = function(e) {
        let saved = JSON.parse(localStorage.getItem("gallery") || "[]");
        saved.push(e.target.result);
        localStorage.setItem("gallery", JSON.stringify(saved));
        loadGallery();
    };
    reader.readAsDataURL(file);
}

function clearGallery() {
    if (confirm("Clear all images?")) {
        localStorage.removeItem("gallery");
        loadGallery();
    }
}
loadGallery();

/* ==========================================================
   6) MODAL VIEWER
========================================================== */
function openModal(src) {
    const box = document.getElementById("modal");
    const img = document.getElementById("modal-img");
    img.src = src;
    box.style.display = "flex";
}

function closeModal(e) {
    if (e.target.id === "modal") {
        document.getElementById("modal").style.display = "none";
    }
}

/* ==========================================================
   7) JOB UPDATES — ADD, FILTER, RENDER
========================================================== */
function loadJobs() {
    return JSON.parse(localStorage.getItem("jobs") || "[]");
}

function saveJobs(jobs) {
    localStorage.setItem("jobs", JSON.stringify(jobs));
}

function addJob() {
    const title = document.getElementById("new-title").value.trim();
    const company = document.getElementById("new-company").value.trim();
    const country = document.getElementById("new-country").value;
    const emp = document.getElementById("new-employmenttype").value;
    const work = document.getElementById("new-worktype").value;
    const level = document.getElementById("new-explevel").value;
    const loc = document.getElementById("new-location").value.trim();

    if (!title || !company) return alert("Title and company are required.");

    const job = { title, company, country, emp, work, level, loc };
    const jobs = loadJobs();
    jobs.push(job);
    saveJobs(jobs);

    renderJobs();
    alert("Job added!");
}

function clearJobs() {
    if (confirm("Delete all jobs?")) {
        saveJobs([]);
        renderJobs();
    }
}

function renderJobs() {
    const list = document.getElementById("job-list");
    list.innerHTML = "";

    const jobs = loadJobs();

    const ft = document.getElementById("filter-worktype").value;
    const fe = document.getElementById("filter-experience").value;
    const fc = document.getElementById("filter-country").value;
    const text = document.getElementById("job-search").value.toLowerCase();

    const filtered = jobs.filter(j =>
        (!ft || j.work === ft) &&
        (!fe || j.level === fe) &&
        (!fc || j.country === fc) &&
        (j.title.toLowerCase().includes(text) || j.company.toLowerCase().includes(text))
    );

    filtered.forEach(j => {
        const card = document.createElement("div");
        card.className = "job-card";

        card.innerHTML = `
            <div class="title">${j.title}</div>
            <div>${j.company}</div>
            <div>${j.work} • ${j.level} • ${j.country}</div>
            <div>📍 ${j.loc}</div>
        `;

        list.appendChild(card);
    });
}

renderJobs();

/* ==========================================================
   8) CHATBOT UI
========================================================== */
const bubble = document.getElementById("chatbot-bubble");
const box = document.getElementById("chatbot-box");

bubble.onclick = () => {
    box.style.display = (box.style.display === "block") ? "none" : "block";
};

document.getElementById("chatbot-send").onclick = sendChatbotMessage;

function sendChatbotMessage() {
    const input = document.getElementById("chatbot-input");
    const msg = input.value.trim();
    if (!msg) return;

    addChat("user", msg);
    input.value = "";

    setTimeout(() => {
        addChat("bot", "Thanks! I will respond soon.");
    }, 500);
}

function addChat(sender, text) {
    const box = document.getElementById("chatbot-messages");
    const div = document.createElement("div");
    div.className = `chatbot-msg ${sender}`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

/* ==========================================================
   9) FOOTER VIEW COUNTER
========================================================== */
let views = localStorage.getItem("views") || 0;
views++;
localStorage.setItem("views", views);
document.getElementById("view-count-footer").innerText = views;
