// script.js - Single background (local), live time, weather, visitor counter, gallery lightbox

// ---------- CONFIG ----------
const LOCAL_BG = "/mnt/data/IMG20240627163038 (1).jpg"; // your uploaded beach image
const PROFILE_IMG = "/mnt/data/profile.jpg"; // profile path

// ---------- set background ----------
(function setBackground() {
  const img = new Image();
  img.onload = () => { document.body.style.backgroundImage = `url('${LOCAL_BG}')`; };
  img.onerror = () => {
    // fallback to Unsplash
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?beach')";
  };
  img.src = LOCAL_BG;
})();

// ---------- live time ----------
function updateTime() {
  const el = document.getElementById("live-time");
  if (el) el.textContent = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ---------- visitor counter (countapi.xyz) ----------
function updateVisitor() {
  const el = document.getElementById("visitor-count");
  if (!el) return;
  const namespace = "subrata_pramanik_site";
  const key = "homepage";
  fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
    .then(r => r.json())
    .then(j => { if (j && j.value) el.textContent = j.value; })
    .catch(() => {
      const k = 'vis_local_v1';
      let val = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, val);
      el.textContent = val;
    });
}
updateVisitor();

// ---------- weather (open-meteo) ----------
function showWeather(obj) {
  const el = document.getElementById("weather");
  if (!el) return;
  if (!obj || !obj.current_weather) {
    el.innerHTML = `<span style="color:var(--muted)">Weather unavailable</span>`;
    return;
  }
  const c = obj.current_weather;
  el.innerHTML = `<strong style="color:var(--accent)">${Math.round(c.temperature)}°C</strong> — wind ${Math.round(c.windspeed)} km/h`;
}

function getWeather() {
  if (!navigator.geolocation) {
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
    return;
  }
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(url).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
  }, err => {
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r => r.json()).then(showWeather).catch(() => showWeather(null));
  }, { timeout: 8000 });
}
getWeather();
setInterval(getWeather, 10 * 60 * 1000);

// ---------- auto-year ----------
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".auto-year").forEach(el => el.textContent = new Date().getFullYear());
});

// ---------- lightbox for gallery ----------
(function lightboxInit() {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<div style="text-align:center"><img id="lb-img" src="" alt=""><div class="caption" id="lb-caption"></div></div>`;
  document.body.appendChild(lb);

  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.id === 'lb-img') {
      lb.classList.remove('open');
    }
  });

  window.openLightbox = function(src, caption) {
    document.getElementById('lb-img').src = src;
    document.getElementById('lb-caption').textContent = caption || '';
    lb.classList.add('open');
  };
})();

// ---------- populate gallery (if present) ----------
(function populateGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;
  for (let i = 1; i <= 24; i++) {
    const path = `images/${i}.jpg`;
    const img = new Image();
    img.src = path;
    img.onload = () => {
      const el = document.createElement('img');
      el.src = path;
      el.alt = `Photo ${i}`;
      el.addEventListener('click', () => openLightbox(path, `Photo ${i}`));
      grid.appendChild(el);
    };
  }
})();
