/* ---------------------------
   script.js — Ultra-clean
   Features: clock, location, weather, gallery, jobs,
             smooth nav, chatbot, CV, modal, dark mode
----------------------------*/

const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = 'subrata_gallery_final';
const JOBS_KEY = 'subrata_jobs_final';
const VIEW_KEY = 'subrata_view_count_final';

/* Loading */
window.addEventListener('load', () => {
  const load = document.getElementById('loading-screen');
  if (!load) return;
  setTimeout(() => {
    load.style.opacity = '0';
    setTimeout(() => load.style.display = 'none', 600);
  }, 500);
});

/* Clock / Date / Day */
function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  const day = now.toLocaleDateString(undefined, { weekday: 'long' });

  const elClock = document.getElementById('clock');
  const elDate = document.getElementById('date');
  const elDay = document.getElementById('dayname');
  const topTime = document.getElementById('top-time');
  const topDate = document.getElementById('top-date');
  const topDay = document.getElementById('top-day');

  if(elClock) elClock.innerText = time;
  if(elDate) elDate.innerText = date;
  if(elDay) elDay.innerText = day;
  if(topTime) topTime.innerText = time;
  if(topDate) topDate.innerText = date;
  if(topDay) topDay.innerText = day;
}
updateClock();
setInterval(updateClock, 1000);

/* Visitor counter (local) */
(function incrementView(){
  try{
    let v = parseInt(localStorage.getItem(VIEW_KEY) || '0', 10);
    v = isNaN(v) ? 1 : v + 1;
    localStorage.setItem(VIEW_KEY, String(v));
    const el = document.getElementById('view-count-footer');
    if(el) el.innerText = v;
  }catch(e){ console.warn(e); }
})();

/* ---------------------------
   USER LOCATION (reverse geocode) + WEATHER + (mini-map kept but hidden)
----------------------------*/
async function reverseGeocode(lat, lon){
  try{
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('reverse geocode failed');
    const data = await res.json();
    const a = data.address || {};
    const city = a.city || a.town || a.village || a.suburb || a.hamlet || a.county || '';
    const state = a.state || '';
    const country = a.country || '';
    const out = [city, state, country].filter(Boolean).join(', ');
    const el = document.getElementById('top-location');
    if(el) el.innerText = out || 'Unknown location';
    return { city, state, country };
  }catch(e){
    console.warn('reverseGeocode', e);
    const el = document.getElementById('top-location');
    if(el) el.innerText = 'Location unavailable';
    return null;
  }
}

async function fetchUserWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();
    if(data.current_weather){
      const el = document.getElementById('temperature');
      if(el) el.innerText = Math.round(data.current_weather.temperature) + '°C';
    }
  }catch(e){ console.warn('fetchUserWeather', e); }
}

function initUserLocation(){
  if(!navigator.geolocation){
    const el = document.getElementById('top-location');
    if(el) el.innerText = 'Geolocation not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    await reverseGeocode(lat, lon);
    fetchUserWeather(lat, lon);
    // Keep mini-map code here (map element exists in DOM) — it is hidden via CSS by default.
    try{
      if(document.getElementById('user-map') && typeof L !== 'undefined'){
        // create map only if Leaflet loaded and element present
        const mapBox = L.map('user-map', { zoomControl:false, attributionControl:false }).setView([lat, lon], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapBox);
        L.marker([lat, lon]).addTo(mapBox);
      }
    }catch(e){ /* silently ignore map errors */ }
  }, (err) => {
    const el = document.getElementById('top-location');
    if(el) el.innerText = 'Location blocked';
  }, { timeout:7000 });
}
initUserLocation();

/* ---------------------------
   7-day Weather (for IIIT or fallback)
----------------------------*/
async function fetchWeeklyWeather(lat=IIIT_COORDS.lat, lon=IIIT_COORDS.lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('weekly weather failed');
    const d = await res.json();
    if(d.daily && d.daily.time){
      const times = d.daily.time;
      const maxs = d.daily.temperature_2m_max;
      const mins = d.daily.temperature_2m_min;
      let html = '<ul style="list-style:none;padding:0;margin:0">';
      for(let i=0;i<Math.min(times.length,7);i++){
        const dt = new Date(times[i]);
        html += `<li style="margin-bottom:6px;">${dt.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}: ${Math.round(mins[i])}° / ${Math.round(maxs[i])}°C</li>`;
      }
      html += '</ul>';
      const el = document.getElementById('daily-weather');
      if(el) el.innerHTML = html;
    }
  }catch(e){
    console.warn('fetchWeeklyWeather', e);
    const el = document.getElementById('daily-weather');
    if(el) el.innerText = 'Weather unavailable';
  }
}
fetchWeeklyWeather();

/* ---------------------------
   IIIT map (kept)
----------------------------*/
(function initIIITMap(){
  try{
    if(typeof L === 'undefined') return;
    if(!document.getElementById('map')) return;
    const map = L.map('map').setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map).bindPopup('<strong>Indian Institute of Information Technology, Allahabad</strong>');
  }catch(e){ console.warn('initIIITMap', e); }
})();

/* ---------------------------
   Jobs (localStorage)
----------------------------*/
function seedJobs(){
  if(localStorage.getItem(JOBS_KEY)) return;
  const seed = [
    { id: Date.now()+1, title: "Research Intern - Medical Imaging", company:"IIIT Allahabad", country:"India", type:"Intern", location:"Allahabad", date:new Date().toISOString() },
    { id: Date.now()+2, title: "Postdoc - Computer Vision", company:"University of X", country:"USA", type:"Full-time", location:"Boston, MA", date:new Date().toISOString() }
  ];
  localStorage.setItem(JOBS_KEY, JSON.stringify(seed));
}
function getJobs(){ seedJobs(); return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]').sort((a,b)=> new Date(b.date)-new Date(a.date)); }
function renderJobs(){
  const list = getJobs();
  const el = document.getElementById('job-list');
  if(!el) return;
  el.innerHTML = '';
  if(list.length === 0){ el.innerHTML = '<div class="small">No job updates.</div>'; return; }
  list.forEach(j => {
    const d = document.createElement('div'); d.className = 'job-card';
    d.innerHTML = `<div style="font-weight:700">${escapeHtml(j.title)}</div><div class="small">${escapeHtml(j.company)} • ${escapeHtml(j.location)} • <span class="small">${new Date(j.date).toLocaleDateString()}</span></div>`;
    el.appendChild(d);
  });
}
renderJobs();

/* ---------------------------
   Gallery
----------------------------*/
function buildYearOptions(){
  const sel = document.getElementById('year-select');
  if(!sel) return;
  sel.innerHTML = '';
  const cy = new Date().getFullYear();
  for(let y = 2000; y <= 2050; y++){
    const o = document.createElement('option'); o.value = String(y); o.textContent = String(y); sel.appendChild(o);
  }
  if(cy >= 2000 && cy <= 2050) sel.value = String(cy);
}
buildYearOptions();

function loadGallery(){ try{ return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]'); }catch(e){ return []; } }
function saveGallery(list){ localStorage.setItem(GALLERY_KEY, JSON.stringify(list)); }

function renderGallery(){
  const sel = document.getElementById('year-select');
  if(!sel) return;
  const year = sel.value;
  const grid = document.getElementById('gallery-grid');
  if(!grid) return;
  const items = loadGallery().filter(it => it.year === String(year));
  grid.innerHTML = '';
  if(items.length === 0){ grid.innerHTML = `<div class="small">No images for ${year}.</div>`; return; }
  items.forEach((it, idx) => {
    const div = document.createElement('div'); div.className = 'gallery-item';
    div.innerHTML = `<img src="${it.data}" alt="img-${idx}" onclick="openModal('${it.data}')" /><div class="small" style="padding:6px;">Added: ${new Date(it.added).toLocaleString()}</div>`;
    grid.appendChild(div);
  });
}
document.getElementById('year-select')?.addEventListener('change', renderGallery);
renderGallery();

function addGalleryImage(){
  const f = document.getElementById('image-file')?.files?.[0];
  const sel = document.getElementById('year-select');
  if(!f){ alert('Select an image'); return; }
  const year = sel ? sel.value : String(new Date().getFullYear());
  const reader = new FileReader();
  reader.onload = e => {
    const arr = loadGallery();
    arr.unshift({ year:String(year), data:e.target.result, added:new Date().toISOString() });
    saveGallery(arr); renderGallery();
  };
  reader.readAsDataURL(f);
}
function clearGallery(){ if(!confirm('Clear gallery?')) return; localStorage.removeItem(GALLERY_KEY); renderGallery(); }

/* ---------------------------
   Modal
----------------------------*/
function openModal(src){ const m = document.getElementById('modal'); if(!m) return; document.getElementById('modal-img').src = src; m.style.display = 'flex'; }
function closeModal(e){ if(!e || e.target.id === 'modal' || e.target.id === 'modal-content') document.getElementById('modal').style.display = 'none'; }

/* ---------------------------
   Contact demo
----------------------------*/
function contactFormSubmit(e){
  e.preventDefault();
  alert('Thanks! Message saved locally (demo).');
  document.getElementById('c_name').value=''; document.getElementById('c_email').value=''; document.getElementById('c_msg').value='';
  return false;
}

/* ---------------------------
   Smooth anchor scroll + nav highlight
----------------------------*/
document.querySelectorAll('nav.global a').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if(href && href.startsWith('#')){
      e.preventDefault();
      const target = document.querySelector(href);
      if(target){
        const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96;
        const pos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 12;
        window.scrollTo({ top: pos, behavior: 'smooth' });
      }
    }
  });
});
window.addEventListener('scroll', ()=>{
  const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96;
  let current = null;
  document.querySelectorAll('section[id]').forEach(s=>{
    if(window.pageYOffset >= s.offsetTop - headerOffset - 20) current = s.id;
  });
  document.querySelectorAll('nav.global a').forEach(a=> a.classList.remove('active'));
  if(current){
    const link = document.querySelector(`nav.global a[href="#${current}"]`);
    if(link) link.classList.add('active');
  }
});

/* ---------------------------
   Theme toggle
----------------------------*/
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  themeToggle.setAttribute('aria-pressed', String(isDark));
});

/* ---------------------------
   Chatbot (simple)
----------------------------*/
const chatbotBubble = document.getElementById('chatbot-bubble');
const chatbotBox = document.getElementById('chatbot-box');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotInput = document.getElementById('chatbot-input');
const msgArea = document.getElementById('chatbot-messages');

chatbotBubble?.addEventListener('click', ()=> {
  const visible = chatbotBox?.style.display === 'block';
  if(chatbotBox) { chatbotBox.style.display = visible ? 'none' : 'block'; chatbotBox.setAttribute('aria-hidden', visible ? 'true' : 'false'); }
});
chatbotSend?.addEventListener('click', sendMessage);
chatbotInput?.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });

function sendMessage(){
  const text = chatbotInput?.value.trim();
  if(!text) return;
  if(msgArea) msgArea.innerHTML += `<div class="chatbot-msg user">${escapeHtml(text)}</div>`;
  if(chatbotInput) chatbotInput.value = '';
  setTimeout(()=> {
    if(msgArea) msgArea.innerHTML += `<div class="chatbot-msg bot">Thanks — I received: ${escapeHtml(text)}</div>`;
    if(msgArea) msgArea.scrollTop = msgArea.scrollHeight;
  }, 500);
}

/* ---------------------------
   Translations (basic)
----------------------------*/
const TRANSLATIONS = {
  en: { "title":"Subrata Pramanik", "nav.home":"Home", "home.p":"Namaskar — I am <strong>Subrata Pramanik</strong>. This page shows my profile, publications, projects, gallery (memory), job updates and more." },
  hi: { "title":"सुब्रत प्रामाणिक", "nav.home":"होम", "home.p":"नमस्कार — मैं <strong>सुब्रत प्रामाणिक</strong> हूँ। यह पृष्ठ मेरा प्रोफ़ाइल, प्रकाशन, परियोजनाएँ और अधिक दिखाता है।" }
};
function applyTranslations(lang='en'){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const map = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    if(map[key]) el.innerHTML = map[key];
  });
  const map = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  if(map['title']){ const st = document.getElementById('site-title'); if(st) st.innerText = map['title']; document.title = map['title']; }
}
document.getElementById('language-switcher')?.addEventListener('change', function(){ applyTranslations(this.value); });
applyTranslations('en');

/* ---------------------------
   Escape helper
----------------------------*/
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------------------------
   CV generator
----------------------------*/
function buildCVHtml(){
  const name = document.getElementById('profile-name')?.innerText || '';
  const meta = document.querySelector('.meta')?.innerText || '';
  const about = document.querySelector('#about p')?.innerText || '';
  return `<html><head><title>CV - ${escapeHtml(name)}</title><style>body{font-family:Georgia;padding:28px;color:#111}h1{font-size:26px}h2{font-size:18px;margin-top:18px;color:#213e63}</style></head><body><h1>${escapeHtml(name)}</h1><div><strong>${escapeHtml(meta)}</strong></div><h2>About</h2><div>${escapeHtml(about)}</div></body></html>`;
}
document.getElementById('cv-open')?.addEventListener('click', ()=>{
  const w = window.open('', '_blank');
  if(!w) return;
  w.document.write(buildCVHtml());
  w.document.close();
  setTimeout(()=> w.print(), 700);
});
document.getElementById('download-cv')?.addEventListener('click', ()=> document.getElementById('cv-open')?.click());

/* ---------------------------
   Init on DOM ready (render gallery/jobs)
----------------------------*/
document.addEventListener('DOMContentLoaded', ()=>{
  buildYearOptions();
  renderGallery();
  seedJobs();
  renderJobs();
});
