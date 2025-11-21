// script.js
// Handles: background slideshow + live weather + visitor counter + live time

// ---------- CONFIG ----------
const UNSPLASH_QUERIES = [
  "beach,sea",
  "ocean,water",
  "nature,sky",
  "mountain,landscape",
  "technology,abstract"
];

// include your uploaded beach image (ensure it's uploaded as bg_beach.jpg in repo)
const LOCAL_BG = "bg_beach.jpg"; // (upload this file in your repo root)

// slideshow images array (mix of Unsplash random queries and your local photo)
let slides = [
  `/${LOCAL_BG}`, // local file first (slash relative)
  `https://source.unsplash.com/1600x900/?${UNSPLASH_QUERIES[0]}`,
  `https://source.unsplash.com/1600x900/?${UNSPLASH_QUERIES[1]}`,
  `https://source.unsplash.com/1600x900/?${UNSPLASH_QUERIES[2]}`,
  `https://source.unsplash.com/1600x900/?${UNSASH_ALT || "landscape"}`
].filter(Boolean);

// fallback: if any undefined, build a simple list
if(slides.length < 4){
  slides = [
    `/${LOCAL_BG}`,
    "https://source.unsplash.com/1600x900/?nature",
    "https://source.unsplash.com/1600x900/?ocean",
    "https://source.unsplash.com/1600x900/?sky"
  ];
}

// ---------- BACKGROUND SLIDESHOW ----------
let slideIndex = 0;
function setBackground(url){
  // preload then set to avoid flicker
  const img = new Image();
  img.onload = () => {
    document.body.style.backgroundImage = `url('${url}')`;
  };
  img.src = url;
}

// immediate set first slide
setBackground(slides[0]);

// change every 10s
function nextSlide(){
  slideIndex = (slideIndex + 1) % slides.length;
  setBackground(slides[slideIndex]);
}
setInterval(nextSlide, 10000); // 10 seconds

// ---------- SMART (day/night) ADJUSTMENT ----------
function applyDayNightOverlay(){
  const hour = new Date().getHours();
  const overlay = document.querySelector(".bg-overlay");
  if(!overlay) return;
  if(hour >= 6 && hour < 12) {
    overlay.style.background = "linear-gradient(180deg, rgba(3,6,10,0.35) 0%, rgba(3,6,10,0.45) 100%)";
  } else if(hour >= 12 && hour < 18) {
    overlay.style.background = "linear-gradient(180deg, rgba(3,6,10,0.45) 0%, rgba(3,6,10,0.6) 100%)";
  } else if(hour >= 18 && hour < 21) {
    overlay.style.background = "linear-gradient(180deg, rgba(3,6,10,0.55) 0%, rgba(3,6,10,0.75) 100%)";
  } else {
    overlay.style.background = "linear-gradient(180deg, rgba(3,6,10,0.7) 0%, rgba(3,6,10,0.85) 100%)";
  }
}
applyDayNightOverlay();
setInterval(applyDayNightOverlay, 60*1000); // update every minute

// ---------- LIVE TIME ----------
function updateTime(){
  const el = document.getElementById("live-time");
  if(el) el.textContent = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ---------- VISITOR COUNTER (countapi.xyz) ----------
function updateVisitorCount(){
  const el = document.getElementById("visitor-count");
  if(!el) return;
  const key = "subrata4532.github.io/pageviews"; // shared key
  fetch('https://api.countapi.xyz/hit/' + key)
    .then(r=>r.json())
    .then(j=>{
      if(j && j.value) el.textContent = j.value;
    })
    .catch(()=> {
      // fallback to local
      const k = 'vis_local_v1';
      let val = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, val);
      el.textContent = val;
    });
}
updateVisitorCount();

// ---------- LIVE WEATHER (open-meteo) ----------
function showWeather(data){
  const el = document.getElementById("weather");
  if(!el) return;
  if(!data) { el.innerHTML = `<span style="color:var(--muted)">Weather unavailable</span>`; return; }
  const t = data.current_weather;
  // open-meteo returns temperature_c and windspeed etc
  el.innerHTML = `<strong style="color:var(--accent)">${Math.round(t.temperature)}°C</strong> — wind ${Math.round(t.windspeed)} km/h`;
}

// get geolocation and call open-meteo
function getWeather(){
  if(!navigator.geolocation){
    showWeather(null);
    return;
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(url).then(r=>r.json()).then(j => {
      showWeather(j);
    }).catch(()=> showWeather(null));
  }, (err)=>{
    // fallback to a generic location (Mumbai lat/lon)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true`;
    fetch(url).then(r=>r.json()).then(j=>showWeather(j)).catch(()=>showWeather(null));
  }, {timeout:8000});
}
getWeather();

// ---------- initialize small extras ----------
document.addEventListener("DOMContentLoaded", ()=>{
  // fill copyright years in any element with class .year
  document.querySelectorAll(".year").forEach(el => el.textContent = new Date().getFullYear());
});
