// script.js - slideshow + weather + live time + visitor counter

// ---------- CONFIG ----------
const LOCAL_BG = "/mnt/data/IMG20240627163038 (1).jpg"; // your uploaded beach image (as requested)
const IMAGE_FOLDER = "images/"; // optional: if you upload additional images into repo/images/
const REMOTE_UNSPLASH = [
  "https://source.unsplash.com/1600x900/?beach,sea",
  "https://source.unsplash.com/1600x900/?ocean,water",
  "https://source.unsplash.com/1600x900/?landscape",
  "https://source.unsplash.com/1600x900/?nature,sky"
];
const SLIDE_INTERVAL_MS = 8000; // 8 seconds

// ---------- build slides array ----------
let slides = [];

// push the local uploaded image path first (so your beach appears)
slides.push(LOCAL_BG);

// then, try to include user images inside /images/ if any (these are optional and must be uploaded)
const autoLocalList = [
  IMAGE_FOLDER + "1.jpg",
  IMAGE_FOLDER + "2.jpg",
  IMAGE_FOLDER + "3.jpg",
  IMAGE_FOLDER + "4.jpg"
];
autoLocalList.forEach(p => slides.push(p));

// finally add Unsplash remote images (random)
slides = slides.concat(REMOTE_UNSPLASH);

// ensure we have at least 3 slides (fallback)
if(slides.length < 3){
  slides = [
    LOCAL_BG,
    "https://source.unsplash.com/1600x900/?nature",
    "https://source.unsplash.com/1600x900/?ocean"
  ];
}

// ---------- slideshow ----------
let slideIndex = 0;
function preloadAndSet(url){
  const img = new Image();
  img.onload = () => { document.body.style.backgroundImage = `url('${url}')`; };
  img.onerror = () => { /* ignore errors (broken link) */ };
  img.src = url;
}

// set initial
preloadAndSet(slides[0]);

function nextSlide(){
  slideIndex = (slideIndex + 1) % slides.length;
  preloadAndSet(slides[slideIndex]);
}
setInterval(nextSlide, SLIDE_INTERVAL_MS);

// ---------- day/night overlay adjustments ----------
function applyOverlayStyle(){
  const hour = new Date().getHours();
  const overlay = document.querySelector(".bg-overlay");
  if(!overlay) return;
  if(hour >= 6 && hour < 12) { overlay.style.background = "linear-gradient(180deg, rgba(2,6,8,0.36), rgba(2,6,8,0.5))"; }
  else if(hour >= 12 && hour < 18) { overlay.style.background = "linear-gradient(180deg, rgba(2,6,8,0.45), rgba(2,6,8,0.6))"; }
  else if(hour >= 18 && hour < 21) { overlay.style.background = "linear-gradient(180deg, rgba(2,6,8,0.55), rgba(2,6,8,0.76))"; }
  else { overlay.style.background = "linear-gradient(180deg, rgba(2,6,8,0.7), rgba(2,6,8,0.86))"; }
}
applyOverlayStyle();
setInterval(applyOverlayStyle, 60*1000);

// ---------- live time ----------
function updateTime(){
  const el = document.getElementById("live-time");
  if(el) el.textContent = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ---------- visitor counter (countapi.xyz) ----------
function updateVisitor(){
  const el = document.getElementById("visitor-count");
  if(!el) return;
  const key = "subrata_pramanik_site_visitors";
  fetch(`https://api.countapi.xyz/hit/${key}/page`)
    .then(r=>r.json())
    .then(j=>{
      if(j && j.value) el.textContent = j.value;
    })
    .catch(()=> {
      // fallback to local storage session counter
      const k='vis_local_v1';
      let val = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, val);
      el.textContent = val;
    });
}
updateVisitor();

// ---------- live weather using open-meteo (no API key required) ----------
function showWeatherText(obj){
  const el = document.getElementById("weather");
  if(!el) return;
  if(!obj || !obj.current_weather){
    el.innerHTML = `<span style="color:var(--muted)">Weather unavailable</span>`;
    return;
  }
  const c = obj.current_weather;
  // open-meteo returns temperature in Celsius and windspeed
  el.innerHTML = `<strong style="color:var(--accent)">${Math.round(c.temperature)}°C</strong> — wind ${Math.round(c.windspeed)} km/h`;
}

function getWeather(){
  if(!navigator.geolocation){
    // fallback location: IIITA ~ Prayagraj (Allahabad) approx lat/lon 25.4358,81.8463
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r=>r.json()).then(showWeatherText).catch(()=>showWeatherText(null));
    return;
  }
  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(url).then(r=>r.json()).then(showWeatherText).catch(()=>showWeatherText(null));
  }, (err)=> {
    // if user blocks geolocation, fallback
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r=>r.json()).then(showWeatherText).catch(()=>showWeatherText(null));
  }, {timeout:8000});
}
getWeather();

// optional: update weather every 10 minutes
setInterval(getWeather, 10*60*1000);

// ---------- set initial copyright years in any elements with class .auto-year ----------
document.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll(".auto-year").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});
