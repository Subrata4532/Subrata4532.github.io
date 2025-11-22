/* ---------------------------
   CONFIG
----------------------------*/
const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = 'subrata_gallery_final';
const JOBS_KEY = 'subrata_jobs_final';
const VIEW_KEY = 'subrata_view_count_final';

/* ---------------------------
   PAGE TITLE
----------------------------*/
document.title = "Subrata Pramanik";

/* ---------------------------
   LOADING SCREEN
----------------------------*/
window.addEventListener("load", () => {
  setTimeout(() => {
    const load = document.getElementById("loading-screen");
    load.style.opacity = 0;
    setTimeout(() => (load.style.display = "none"), 600);
  }, 500);
});

/* ---------------------------
   CLOCK + DATE
----------------------------*/
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  const day = now.toLocaleDateString(undefined, { weekday: "long" });

  document.getElementById("clock").innerText = time;
  document.getElementById("date").innerText = date;
  document.getElementById("dayname").innerText = day;

  document.getElementById("top-time").innerText = time;
  document.getElementById("top-date").innerText = date;
  document.getElementById("top-day").innerText = day;
}
setInterval(updateClock, 1000);
updateClock();

/* ---------------------------
   VISITOR COUNTER (LOCAL)
----------------------------*/
function incrementView() {
  let v = parseInt(localStorage.getItem(VIEW_KEY) || "0", 10);
  v++;
  localStorage.setItem(VIEW_KEY, String(v));
  document.getElementById("view-count-footer").innerText = v;
}
incrementView();

/* ============================================================
      USER LOCATION + WEATHER + MINI MAP
============================================================ */

async function getReverseLocation(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    const address = data.address;
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      "Unknown";

    const state = address.state || "";
    const country = address.country || "";

    document.getElementById("top-location").innerText =
      `${city}, ${state}, ${country}`;
  } catch (e) {
    console.warn("Location error:", e);
    document.getElementById("top-location").innerText = "Location unavailable";
  }
}

function loadUserMiniMap(lat, lon) {
  const mapBox = document.getElementById("user-map");
  mapBox.style.display = "block";

  const mapUser = L.map("user-map", {
    zoomControl: false,
    attributionControl: false,
  }).setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
    mapUser
  );

  L.marker([lat, lon]).addTo(mapUser);
}

async function fetchWeatherUser(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.current_weather) {
      document.getElementById("temperature").innerText =
        Math.round(data.current_weather.temperature) + "°C";
    }
  } catch (e) {
    console.warn("Weather error:", e);
  }
}

function initFullUserLocation() {
  if (!navigator.geolocation) {
    document.getElementById("top-location").innerText =
      "Geolocation not supported";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      // Location
      await getReverseLocation(lat, lon);

      // Weather
      fetchWeatherUser(lat, lon);

      // Map
      loadUserMiniMap(lat, lon);
    },
    () => {
      document.getElementById("top-location").innerText = "Location blocked";
    }
  );
}

initFullUserLocation();

/* ============================================================
      WEEKLY WEATHER
============================================================ */

async function fetchWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    const d = await res.json();

    const times = d.daily.time;
    const maxs = d.daily.temperature_2m_max;
    const mins = d.daily.temperature_2m_min;

    let html = "<ul style='list-style:none;padding:0'>";
    for (let i = 0; i < times.length; i++) {
      const dt = new Date(times[i]);
      html += `<li>${dt.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}: ${mins[i]}° / ${maxs[i]}°C</li>`;
    }
    html += "</ul>";

    document.getElementById("daily-weather").innerHTML = html;
  } catch (e) {
    console.warn(e);
    document.getElementById("daily-weather").innerText =
      "Weather unavailable";
  }
}

fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);

/* ============================================================
      IIIT ALLAHABAD MAP
============================================================ */

const map = L.map("map").setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 12);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon])
  .addTo(map)
  .bindPopup("<b>IIIT Allahabad</b>");

/* ============================================================
      JOBS SYSTEM
============================================================ */

function seedJobs() {
  if (!localStorage.getItem(JOBS_KEY)) {
    const seed = [
      {
        id: Date.now()+1,
        title: "Research Intern - Medical Imaging",
        company: "IIIT Allahabad",
        country: "India",
        type: "Intern",
        location: "Allahabad",
        date: new Date().toISOString(),
      },
      {
        id: Date.now()+2,
        title: "Postdoc - Computer Vision",
        company: "University of X",
        country: "USA",
        type: "Full-time",
        location: "Boston",
        date: new Date().toISOString(),
      },
    ];
    localStorage.setItem(JOBS_KEY, JSON.stringify(seed));
  }
}

function getJobs() {
  seedJobs();
  return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]").sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

function renderJobs() {
  const jobs = getJobs();
  const box = document.getElementById("job-list");
  box.innerHTML = "";

  jobs.forEach((j) => {
    const div = document.createElement("div");
    div.className = "job-card";
    div.innerHTML = `
      <b>${j.title}</b><br>
      <span class="small">${j.company} • ${j.location}</span>
    `;
    box.appendChild(div);
  });
}

renderJobs();

/* ============================================================
      GALLERY
============================================================ */

function buildYearOptions() {
  const sel = document.getElementById("year-select");
  for (let y = 2000; y <= 2050; y++) {
    const o = document.createElement("option");
    o.value = y;
    o.innerText = y;
    sel.appendChild(o);
  }
  sel.value = new Date().getFullYear();
}
buildYearOptions();

function loadGallery() {
  return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]");
}
function saveGallery(list) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
}

function renderGallery() {
  const year = document.getElementById("year-select").value;
  const items = loadGallery().filter((g) => g.year === year);

  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  if (items.length === 0) {
    grid.innerHTML = "<div>No images</div>";
    return;
  }

  items.forEach((it) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `<img src="${it.data}" onclick="openModal('${it.data}')">`;
    grid.appendChild(div);
  });
}
renderGallery();

function addGalleryImage() {
  const file = document.getElementById("image-file").files[0];
  if (!file) return alert("Choose an image");

  const year = document.getElementById("year-select").value;
  const reader = new FileReader();

  reader.onload = (e) => {
    const arr = loadGallery();
    arr.unshift({
      year,
      data: e.target.result,
      added: new Date().toISOString(),
    });
    saveGallery(arr);
    renderGallery();
  };

  reader.readAsDataURL(file);
}

function clearGallery() {
  if (confirm("Clear gallery?")) {
    localStorage.removeItem(GALLERY_KEY);
    renderGallery();
  }
}

/* ============================================================
      MODAL
============================================================ */
function openModal(src) {
  document.getElementById("modal-img").src = src;
  document.getElementById("modal").style.display = "flex";
}
document.getElementById("modal").onclick = () =>
  (document.getElementById("modal").style.display = "none");

/* ============================================================
      CONTACT FORM
============================================================ */
function contactFormSubmit(e) {
  e.preventDefault();
  alert("Message stored locally (demo).");
  document.getElementById("c_name").value = "";
  document.getElementById("c_email").value = "";
  document.getElementById("c_msg").value = "";
}

/* ============================================================
      SMOOTH SCROLL + NAV HIGHLIGHT
============================================================ */

document.querySelectorAll("nav.global a").forEach((a) => {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    const target = document.querySelector(href);
    const top = target.offsetTop - 80;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

/* ============================================================
      THEME TOGGLE
============================================================ */

document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
  document.getElementById("theme-toggle").innerText =
    document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
};

/* ============================================================
      CHATBOT
============================================================ */

document.getElementById("chatbot-bubble").onclick = () => {
  const box = document.getElementById("chatbot-box");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

document.getElementById("chatbot-send").onclick = sendMessage;
document.getElementById("chatbot-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const input = document.getElementById("chatbot-input");
  const msg = input.value.trim();
  if (!msg) return;

  const area = document.getElementById("chatbot-messages");
  area.innerHTML += `<div class="chatbot-msg user">${msg}</div>`;
  input.value = "";

  setTimeout(() => {
    area.innerHTML += `<div class="chatbot-msg bot">Thanks — I received: ${msg}</div>`;
    area.scrollTop = area.scrollHeight;
  }, 500);
}

/* ============================================================
      CV GENERATOR
============================================================ */

function buildCVHtml() {
  const name = document.getElementById("profile-name").innerText;
  const meta = document.querySelector(".meta").innerText;
  const about = document.querySelector("#about p").innerText;

  return `
    <html>
    <head><title>CV - ${name}</title></head>
    <body style="font-family:Georgia;padding:30px;">
      <h1>${name}</h1>
      <strong>${meta}</strong>
      <h2>About</h2>
      ${about}
    </body>
    </html>
  `;
}

document.getElementById("cv-open").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write(buildCVHtml());
  w.document.close();
  setTimeout(() => w.print(), 500);
};

document.getElementById("download-cv").onclick = () =>
  document.getElementById("cv-open").click();
