/* --------------------------
   CONFIGURATION
--------------------------- */

const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = "subrata_gallery_v2";
const JOBS_KEY = "subrata_jobs_v2";
const VIEW_KEY = "subrata_view_count_v3";

/* --------------------------
   CLOCK
--------------------------- */
function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerText = now.toLocaleTimeString();
  document.getElementById("date").innerText = now.toLocaleDateString();
}
setInterval(updateClock, 1000);
updateClock();

/* --------------------------
   VIEW COUNTER
--------------------------- */
function incrementView() {
  let v = parseInt(localStorage.getItem(VIEW_KEY) || "0", 10);
  v++;
  localStorage.setItem(VIEW_KEY, v);
  document.getElementById("view-count-footer").innerText = v;
}
incrementView();

/* --------------------------
   WEATHER (Open-Meteo)
--------------------------- */
async function showWeather(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );
    const data = await res.json();
    if (data && data.current_weather) {
      const t = data.current_weather.temperature;
      document.getElementById("temperature").innerText = `${t}°C`;
      document.getElementById("mini-weather").innerText = `Current: ${t}°C • Wind ${data.current_weather.windspeed} km/h`;
    }
  } catch (e) {
    document.getElementById("mini-weather").innerText = "Weather unavailable";
  }
}

function initWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (p) => showWeather(p.coords.latitude, p.coords.longitude),
      () => showWeather(IIIT_COORDS.lat, IIIT_COORDS.lon),
      { timeout: 7000 }
    );
  } else {
    showWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
  }
}

/* --------------------------
   LEAFLET MAP
--------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const map = L.map("map", { zoomControl: true }).setView(
    [IIIT_COORDS.lat, IIIT_COORDS.lon],
    11
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  const marker = L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map);
  marker.bindPopup("<strong>Indian Institute of Information Technology Allahabad</strong>");
});

/* --------------------------
   JOBS STORAGE HANDLER
--------------------------- */
function seedJobs() {
  if (localStorage.getItem(JOBS_KEY)) return;

  const seed = [
    {
      id: Date.now() + 1,
      title: "Research Intern - Medical Imaging",
      company: "IIIT Allahabad",
      country: "India",
      type: "Intern",
      location: "Allahabad",
      date: new Date().toISOString()
    },
    {
      id: Date.now() + 2,
      title: "Postdoc - Computer Vision",
      company: "University of X",
      country: "USA",
      type: "Full-time",
      location: "Boston, MA",
      date: new Date().toISOString()
    }
  ];

  localStorage.setItem(JOBS_KEY, JSON.stringify(seed));
}

function readJobs() {
  seedJobs();
  return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]").sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

function saveJobs(list) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(list));
}

let activeTab = "India";

function setTab(t) {
  activeTab = t;
  renderJobs();
}

function renderJobs() {
  const all = readJobs();
  const search = (document.getElementById("search-key").value || "").toLowerCase();

  let filtered = all.filter((j) => j.country === activeTab);

  if (search) {
    filtered = filtered.filter((j) =>
      (j.title + j.company + j.location).toLowerCase().includes(search)
    );
  }

  const listEl = document.getElementById("job-list");
  listEl.innerHTML = "";

  if (!filtered.length) {
    listEl.innerHTML = '<div class="small">No job updates.</div>';
    return;
  }

  filtered.forEach((j) => {
    const d = document.createElement("div");
    d.className = "job-card";
    d.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <div>
          <div style="font-weight:700">${escapeHtml(j.title)}</div>
          <div class="small">${escapeHtml(j.company)} • ${escapeHtml(j.location)} • ${new Date(
      j.date
    ).toLocaleDateString()}</div>
          <div><span class="pill">${escapeHtml(j.type)}</span></div>
        </div>
        <button onclick="removeJob(${j.id})" class="btn" style="background:#fff; color:#000; border:1px solid #ddd">Remove</button>
      </div>`;
    listEl.appendChild(d);
  });
}

function addJob() {
  const title = document.getElementById("new-title").value.trim();
  const company = document.getElementById("new-company").value.trim();
  const location = document.getElementById("new-location").value.trim();
  const country = document.getElementById("new-country").value;
  const type = document.getElementById("new-type").value;

  if (!title || !company) {
    alert("Enter job title and company!");
    return;
  }

  const jobs = readJobs();
  jobs.unshift({
    id: Date.now(),
    title,
    company,
    country,
    type,
    location,
    date: new Date().toISOString()
  });

  saveJobs(jobs);
  renderJobs();

  document.getElementById("new-title").value = "";
  document.getElementById("new-company").value = "";
  document.getElementById("new-location").value = "";
}

function removeJob(id) {
  if (!confirm("Remove this job?")) return;
  saveJobs(readJobs().filter((j) => j.id !== id));
  renderJobs();
}

function clearJobs() {
  if (!confirm("Clear ALL job postings?")) return;
  localStorage.removeItem(JOBS_KEY);
  seedJobs();
  renderJobs();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* --------------------------
   GALLERY FUNCTIONALITY
--------------------------- */
function loadGallery() {
  return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]");
}

function saveGallery(list) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
}

function renderGallery() {
  const y = document.getElementById("year-select").value;
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  const arr = loadGallery().filter((x) => x.year === y);

  if (!arr.length) {
    grid.innerHTML = `<div class="small">No images for ${y}</div>`;
    return;
  }

  arr.forEach((it, idx) => {
    const div = document.createElement("div");
    div.className = "gallery-item";
    div.innerHTML = `<img src="${it.data}" onclick="openModal('${it.data}')">`;
    grid.appendChild(div);
  });
}

function addGalleryImage() {
  const year = document.getElementById("year-select").value;
  const file = document.getElementById("image-file").files[0];

  if (!file) {
    alert("Select image!");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const arr = loadGallery();
    arr.unshift({
      year,
      data: e.target.result,
      added: new Date().toISOString()
    });
    saveGallery(arr);
    renderGallery();
  };
  reader.readAsDataURL(file);
}

function clearGallery() {
  if (!confirm("Clear gallery?")) return;
  localStorage.removeItem(GALLERY_KEY);
  renderGallery();
}

/* --------------------------
   MODAL IMAGES
--------------------------- */
function openModal(src) {
  document.getElementById("modal-img").src = src;
  document.getElementById("modal").style.display = "flex";
}
function closeModal(e) {
  if (!e || e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
}

/* --------------------------
   CONTACT FORM
--------------------------- */
function contactFormSubmit(e) {
  e.preventDefault();
  alert("Thanks! Your message is saved locally.");
  document.getElementById("c_name").value = "";
  document.getElementById("c_email").value = "";
  document.getElementById("c_msg").value = "";
  return false;
}

/* --------------------------
   SMOOTH SCROLL + ACTIVE NAV
--------------------------- */
function enableAnchors() {
  const header = document.getElementById("site-header");
  const links = document.querySelectorAll("nav.global a");
  const headerHeight = header ? header.offsetHeight : 100;

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const pos = target.offsetTop - headerHeight - 10;
          window.scrollTo({ top: pos, behavior: "smooth" });
        }
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");

  function onScroll() {
    const y = window.pageYOffset;
    let current = null;

    sections.forEach((s) => {
      if (y >= s.offsetTop - headerHeight - 20) current = s;
    });

    links.forEach((l) => l.classList.remove("active"));

    if (current) {
      const link = document.querySelector(`nav.global a[href="#${current.id}"]`);
      if (link) link.classList.add("active");
    }
  }

  window.addEventListener("scroll", onScroll);
  onScroll();
}

/* --------------------------
   REVEAL SECTIONS ON SCROLL
--------------------------- */
function setupReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".section-card").forEach((el) => obs.observe(el));
}

/* --------------------------
   INITIALIZE EVERYTHING
--------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  initWeather();
  seedJobs();
  renderJobs();
  renderGallery();
  enableAnchors();
  setupReveal();

  const stored = parseInt(localStorage.getItem(VIEW_KEY) || "0", 10);
  document.getElementById("view-count-footer").innerText = stored;
});
