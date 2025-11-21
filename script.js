/* script.js - Live time, weather, visitor counter, gallery lightbox, accordion, job updates */

const SITE_NAMESPACE = "subrata_pramanik_site_v1";
const VISITOR_KEY = "homepage_count";

/* --- Live time --- */
function updateTime() {
  const el = document.getElementById("live-time");
  if (el) el.textContent = new Date().toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

/* --- Auto year --- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".auto-year").forEach(e => e.textContent = new Date().getFullYear());
});

/* --- Visitor counter using countapi.xyz (no key required) --- */
function updateVisitorCount() {
  const el = document.getElementById("visitor-count");
  if (!el) return;
  const namespace = "subrata_pramanik_gh_pages"; // measurable unique key
  const key = "visitors";
  fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
    .then(r => r.json())
    .then(j => {
      if (j && j.value) el.textContent = j.value;
    })
    .catch(() => {
      // fallback: local increment
      let v = Number(localStorage.getItem(VISITOR_KEY) || 0) + 1;
      localStorage.setItem(VISITOR_KEY, v);
      el.textContent = v;
    });
}
updateVisitorCount();

/* --- Weather (Open-Meteo, no key) --- */
function showWeather(obj) {
  const el = document.getElementById("weather");
  if (!el) return;
  if (!obj || !obj.current_weather) {
    el.textContent = "Weather unavailable";
    return;
  }
  const c = obj.current_weather;
  el.innerHTML = `${Math.round(c.temperature)}°C • Wind ${Math.round(c.windspeed)} km/h`;
}

function getWeather() {
  // Try geolocation, otherwise fallback to Prayagraj coordinates (IIITA)
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude.toFixed(4);
      const lon = pos.coords.longitude.toFixed(4);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      fetch(url).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
    }, () => {
      const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
      fetch(fallback).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
    }, {timeout:8000});
  } else {
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
  }
}
getWeather();
setInterval(getWeather, 10*60*1000);

/* --- Accordion behavior --- */
document.addEventListener("click", e => {
  const accHead = e.target.closest(".acc-head");
  if (accHead) {
    const item = accHead.parentElement;
    const body = item.querySelector(".acc-body");
    const open = body.style.display === "block";
    // close all in same accordion
    const parent = item.parentElement;
    parent.querySelectorAll(".acc-body").forEach(b => b.style.display = "none");
    if (!open) body.style.display = "block";
  }
});

/* --- Gallery lightbox --- */
(function initLightbox() {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `<img src="" alt="Large">`;
  document.body.appendChild(lb);
  lb.addEventListener("click", () => lb.classList.remove("open"));
  window.openLightbox = (src) => {
    lb.querySelector("img").src = src;
    lb.classList.add("open");
  }
})();

/* --- Populate gallery from /images/1.jpg..N --- */
function populateGallery() {
  const grid = document.getElementById("gallery-grid");
  if (!grid) return;
  // try to load first 12 images; user can add more
  for (let i=1;i<=12;i++){
    const path = `images/${i}.jpg`;
    const img = new Image();
    img.src = path;
    img.onload = () => {
      const el = document.createElement("img");
      el.src = path;
      el.alt = `Photo ${i}`;
      el.addEventListener("click", () => openLightbox(path));
      grid.appendChild(el);
    };
  }
}
document.addEventListener("DOMContentLoaded", populateGallery);

/* --- Job updates (save to localStorage) --- */
const JOBS_KEY = "subrata_job_updates_v1";

// job model: {id, region: "India"|"USA", level: "Intern|Early|Mid|Senior", title, company, link, posted, description}
function loadJobs() {
  try {
    return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
  } catch { return []; }
}
function saveJobs(jobs) { localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)) }

function renderJobs() {
  const listIndia = document.getElementById("jobs-india");
  const listUSA = document.getElementById("jobs-usa");
  if (!listIndia || !listUSA) return;
  listIndia.innerHTML = "";
  listUSA.innerHTML = "";
  const jobs = loadJobs().sort((a,b)=> new Date(b.posted) - new Date(a.posted));
  jobs.forEach(j => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.marginBottom = "10px";
    div.innerHTML = `<h3 style="margin:0">${escapeHTML(j.title)}</h3>
      <div style="color:var(--muted);font-size:0.95rem">${escapeHTML(j.company)} • <strong>${escapeHTML(j.level)}</strong> • <small>${(new Date(j.posted)).toLocaleDateString()}</small></div>
      <p style="color:var(--muted);margin-top:10px">${escapeHTML(j.description || "")}</p>
      <div style="margin-top:8px"><a href="${escapeAttr(j.link)}" target="_blank" class="btn" style="padding:8px 10px;font-size:0.9rem;text-decoration:none">Open link</a></div>`;
    if (j.region === "India") listIndia.appendChild(div); else listUSA.appendChild(div);
  });
}

function addJobFromForm(e) {
  e.preventDefault();
  const form = e.target;
  const title = form.title.value.trim();
  const company = form.company.value.trim();
  const link = form.link.value.trim();
  const level = form.level.value;
  const region = form.region.value;
  const desc = form.description.value.trim();
  if (!title || !company) { alert("Title and company required"); return; }
  const jobs = loadJobs();
  jobs.push({id:Date.now(), title, company, link, level, region, description:desc, posted:new Date().toISOString()});
  saveJobs(jobs);
  form.reset();
  renderJobs();
}

/* small helper to avoid injection in inserted HTML */
function escapeHTML(str){ return String(str||"").replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return encodeURI(s||""); }

document.addEventListener("DOMContentLoaded", ()=> {
  const f = document.getElementById("job-add-form");
  if (f) f.addEventListener("submit", addJobFromForm);
  renderJobs();
});

/* --- prevent copying? we add small copyright notice and disable right-click copy warning (not foolproof) */
document.addEventListener("contextmenu", e => {
  /* allow right-click; we will only show small copyright text in footer */
});
