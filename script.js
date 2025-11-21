// script.js - Single background + overlay + live time + weather + visitor counter

// ---------- CONFIG ----------
const LOCAL_BG = "/mnt/data/IMG20240627163038 (1).jpg"; // your uploaded beach image (exact path)
const SLIGHT_DARKEN = true; // overlay is set in CSS

// ---------- set background safely ----------
(function setInitialBackground(){
  const img = new Image();
  img.onload = ()=> { document.body.style.backgroundImage = `url('${LOCAL_BG}')`; };
  img.onerror = ()=> {
    // fallback to an unsplash image if local file not accessible
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?beach,sea')";
  };
  img.src = LOCAL_BG;
})();

// ---------- live time ----------
function updateTime(){
  const el = document.getElementById("live-time");
  if(el) el.textContent = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ---------- visitor counter via countapi.xyz ----------
function updateVisitor(){
  const el = document.getElementById("visitor-count");
  if(!el) return;
  const namespace = "subrata_pramanik_site";
  const key = "homepage";
  fetch(`https://api.countapi.xyz/hit/${namespace}/${key}`)
    .then(r=>r.json())
    .then(j=> { if(j && j.value) el.textContent = j.value; })
    .catch(()=> {
      // fallback local increment
      const k = 'vis_local_v1';
      let val = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, val);
      el.textContent = val;
    });
}
updateVisitor();

// ---------- weather (open-meteo, no API key) ----------
function showWeather(obj){
  const el = document.getElementById("weather");
  if(!el) return;
  if(!obj || !obj.current_weather){ el.innerHTML = `<span style="color:var(--muted)">Weather unavailable</span>`; return; }
  const c = obj.current_weather;
  el.innerHTML = `<strong style="color:var(--accent)">${Math.round(c.temperature)}°C</strong> — wind ${Math.round(c.windspeed)} km/h`;
}

function getWeather(){
  if(!navigator.geolocation){
    // fallback to Prayagraj (IIITA)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(url).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
    return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(url).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
  }, err=>{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(url).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
  }, {timeout:8000});
}
getWeather();
setInterval(getWeather, 10*60*1000); // every 10 minutes

// ---------- set auto-year elements ----------
document.addEventListener("DOMContentLoaded", ()=>{
  document.querySelectorAll(".auto-year").forEach(el => el.textContent = new Date().getFullYear());
});
