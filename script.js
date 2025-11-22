/* ---------------------------
   Config
----------------------------*/
const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = 'subrata_gallery_final';
const JOBS_KEY = 'subrata_jobs_final';
const VIEW_KEY = 'subrata_view_count_final';

/* ---------------------------
   Loading and page title
----------------------------*/
document.title = "Subrata Pramanik";
window.addEventListener('load', () => {
  setTimeout(()=> {
    const el = document.getElementById('loading-screen');
    if(!el) return;
    el.style.opacity = 0;
    el.setAttribute('aria-hidden','true');
    setTimeout(()=> el.style.display = 'none', 600);
  }, 700);
});

/* ---------------------------
   Clock, Date & Day (top-left & left-column)
----------------------------*/
function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  const dayName = now.toLocaleDateString(undefined,{ weekday:'long' });
  if(document.getElementById('clock')) document.getElementById('clock').innerText = time;
  if(document.getElementById('date')) document.getElementById('date').innerText = date;
  if(document.getElementById('dayname')) document.getElementById('dayname').innerText = dayName;
  if(document.getElementById('top-time')) document.getElementById('top-time').innerText = time;
  if(document.getElementById('top-date')) document.getElementById('top-date').innerText = date;
  if(document.getElementById('top-day')) document.getElementById('top-day').innerText = dayName;
}
setInterval(updateClock, 1000);
updateClock();

/* ---------------------------
   Visitor counter (local)
----------------------------*/
function incrementView(){
  try{
    let v = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
    v++;
    localStorage.setItem(VIEW_KEY, String(v));
    if(document.getElementById('view-count-footer')) document.getElementById('view-count-footer').innerText = v;
  }catch(e){ console.warn(e); }
}
incrementView();

/* ---------------------------
   Weather (Open-Meteo) - current + 7-day
----------------------------*/
async function fetchWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();

    if(data.current_weather && document.getElementById('temperature')){
      document.getElementById('temperature').innerText = `${Math.round(data.current_weather.temperature)}°C`;
    } else if(document.getElementById('temperature')){
      document.getElementById('temperature').innerText = 'N/A';
    }

    if(data.daily && data.daily.time && document.getElementById('daily-weather')){
      const times = data.daily.time;
      const maxs = data.daily.temperature_2m_max;
      const mins = data.daily.temperature_2m_min;
      let html = '<ul style="list-style:none;padding:0;margin:0;">';
      for(let i=0;i<Math.min(7,times.length);i++){
        const d = new Date(times[i]);
        const opts = { weekday:'short', month:'short', day:'numeric' };
        html += `<li style="margin-bottom:6px;">${d.toLocaleDateString(undefined,opts)}: ${Math.round(mins[i])}° / ${Math.round(maxs[i])}°C</li>`;
      }
      html += '</ul>';
      document.getElementById('daily-weather').innerHTML = html;
    } else if(document.getElementById('daily-weather')){
      document.getElementById('daily-weather').innerText = 'Daily forecast unavailable';
    }
  }catch(e){
    console.warn(e);
    if(document.getElementById('temperature')) document.getElementById('temperature').innerText = 'Weather unavailable';
    if(document.getElementById('daily-weather')) document.getElementById('daily-weather').innerText = 'Weather unavailable';
  }
}
function initWeather(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeather(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
    }, { timeout:7000 });
  } else {
    fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
  }
}
initWeather();

/* ---------------------------
   Leaflet map (IIIT)
----------------------------*/
const map = L.map('map', { zoomControl:true }).setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
const marker = L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map);
marker.bindPopup("<strong>Indian Institute Of Information Technology,Allahabad</strong>").openPopup();

/* ---------------------------
   Jobs (localStorage)
----------------------------*/
function seedJobs(){
  if(localStorage.getItem(JOBS_KEY)) return;
  const seed = [
    { id: Date.now()+1, title:"Research Intern - Medical Imaging", company:"Indian Institute Of Information Technology", country:"India", type:"Intern", location:"Allahabad", date:new Date().toISOString() },
    { id: Date.now()+2, title:"Postdoc - Computer Vision", company:"University of X", country:"USA", type:"Full-time", location:"Boston, MA", date:new Date().toISOString() }
  ];
  localStorage.setItem(JOBS_KEY, JSON.stringify(seed));
}
function readJobs(){ seedJobs(); return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]").sort((a,b)=> new Date(b.date) - new Date(a.date)); }
function saveJobs(list){ localStorage.setItem(JOBS_KEY, JSON.stringify(list)); }

let activeTab = "India";
function setTab(t){ activeTab = t; renderJobs(); }
function renderJobs(){
  const all = readJobs();
  const search = (document.getElementById('search-key')?.value || '').toLowerCase();
  let filtered = all.filter(j=> j.country === activeTab);
  if(search) filtered = filtered.filter(j => (j.title + j.company + j.location).toLowerCase().includes(search));
  const listEl = document.getElementById('job-list'); listEl.innerHTML = '';
  if(filtered.length === 0){ listEl.innerHTML = "<div class='small'>No job updates.</div>"; return; }
  filtered.forEach(j=>{
    const div = document.createElement('div');
    div.className = 'job-card';
    div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;">
      <div style="flex:1">
        <div style="font-weight:700">${escapeHtml(j.title)}</div>
        <div class="small">${escapeHtml(j.company)} • ${escapeHtml(j.location)} • <span class="small">${new Date(j.date).toLocaleDateString()}</span></div>
        <div style="margin-top:8px;"><span class="pill">${escapeHtml(j.type)}</span></div>
      </div>
      <div style="margin-left:12px;"><button onclick="removeJob(${j.id})" style="padding:6px 8px;border-radius:8px;border:1px solid #eee;background:#fff;cursor:pointer">Remove</button></div>
    </div>`;
    listEl.appendChild(div);
  });
}
function addJob(){
  const title = document.getElementById('new-title').value.trim();
  const company = document.getElementById('new-company').value.trim();
  const country = document.getElementById('new-country').value;
  const type = document.getElementById('new-type').value;
  const location = document.getElementById('new-location').value.trim();
  if(!title || !company){ alert('Enter title and company'); return; }
  const jobs = readJobs();
  jobs.unshift({ id:Date.now(), title, company, country, type, location, date:new Date().toISOString() });
  saveJobs(jobs); renderJobs();
  document.getElementById('new-title').value=''; document.getElementById('new-company').value=''; document.getElementById('new-location').value='';
}
function removeJob(id){ if(!confirm('Remove this job?')) return; saveJobs(readJobs().filter(j=> j.id !== id)); renderJobs(); }
function clearJobs(){ if(!confirm('Clear all job postings?')) return; localStorage.removeItem(JOBS_KEY); seedJobs(); renderJobs(); }

/* ---------------------------
   Gallery (years 2000-3000)
----------------------------*/
function buildYearOptions(){
  const sel = document.getElementById('year-select');
  sel.innerHTML = '';
  for(let y=2000;y<=3000;y++){
    const o = document.createElement('option'); o.value = String(y); o.textContent = String(y);
    sel.appendChild(o);
  }
  const cy = (new Date()).getFullYear();
  if(cy>=2000 && cy<=3000) sel.value = String(cy);
}
function loadGallery(){ try{ return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]"); } catch(e){ return []; } }
function saveGallery(list){ localStorage.setItem(GALLERY_KEY, JSON.stringify(list)); }
function renderGallery(){
  const year = document.getElementById('year-select').value;
  const grid = document.getElementById('gallery-grid'); grid.innerHTML = '';
  const items = loadGallery().filter(it => it.year === String(year));
  if(items.length === 0){ grid.innerHTML = "<div class='small'>No images for " + year + ".</div>"; return; }
  items.forEach((it, idx) => {
    const div = document.createElement('div'); div.className = 'gallery-item';
    div.innerHTML = `<img src="${it.data}" alt="img-${idx}" onclick="openModal('${it.data}')" /><div class="small" style="padding:6px;">Added: ${new Date(it.added).toLocaleString()}</div>`;
    grid.appendChild(div);
  });
}
function addGalleryImage(){
  const f = document.getElementById('image-file').files[0];
  const year = document.getElementById('year-select').value;
  if(!f){ alert('Select an image'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const arr = loadGallery(); arr.unshift({ year:String(year), data:e.target.result, added:new Date().toISOString() });
    saveGallery(arr); renderGallery();
  };
  reader.readAsDataURL(f);
}
function clearGallery(){ if(!confirm('Clear gallery?')) return; localStorage.removeItem(GALLERY_KEY); renderGallery(); }

/* ---------------------------
   Modal
----------------------------*/
function openModal(src){ document.getElementById('modal-img').src = src; const m = document.getElementById('modal'); m.style.display = 'flex'; }
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
   Smooth anchor scroll + active nav highlight
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
        window.scrollTo({ top: pos, behavior:'smooth' });
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
   Theme toggle (day/night)
----------------------------*/
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', ()=>{
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

if(chatbotBubble){
  chatbotBubble.addEventListener('click', ()=> {
    const visible = chatbotBox.style.display === 'block';
    chatbotBox.style.display = visible ? 'none' : 'block';
    chatbotBox.setAttribute('aria-hidden', visible ? 'true' : 'false');
  });
}
if(chatbotSend){
  chatbotSend.addEventListener('click', sendMessage);
  chatbotInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });
}
function sendMessage(){
  const text = chatbotInput.value.trim();
  if(!text) return;
  msgArea.innerHTML += `<div class="chatbot-msg user">${escapeHtml(text)}</div>`;
  chatbotInput.value = '';
  setTimeout(()=> {
    msgArea.innerHTML += `<div class="chatbot-msg bot">Thanks — I received: ${escapeHtml(text)}</div>`;
    msgArea.scrollTop = msgArea.scrollHeight;
  }, 500);
}

/* ---------------------------
   Simple translations - EN + HI (expandable)
----------------------------*/
const TRANSLATIONS = {
  en: { "title":"Namaskar — Subrata Pramanik", "nav.home":"Home", "nav.about":"About", "home.title":"Home",
    "home.p":"Namaskar — I am <strong>Subrata Pramanik</strong>. This page shows my profile, publications, projects, gallery (memory), job updates and more.",
    "quicklinks":"Quick Links", "resume.title":"Resume", "publications.title":"Publications",
    "projects.title":"Projects", "skills.title":"Skills", "memory.title":"Memory (Gallery)", "jobs.title":"Job Updates",
    "map.title":"World Map", "contact.title":"Contact"
  },
  hi: { "title":"नमस्कार — सुब्रत प्रामाणिक", "nav.home":"होम", "nav.about":"परिचय", "home.title":"होम",
    "home.p":"नमस्कार — मैं <strong>सुब्रत प्रामाणिक</strong> हूँ। यह पृष्ठ मेरा प्रोफ़ाइल, प्रकाशन, परियोजनाएँ और अधिक दिखाता है।",
    "quicklinks":"त्वरित लिंक", "resume.title":"रिज़्यूमे", "publications.title":"प्रकाशन",
    "projects.title":"प्रोजेक्ट्स", "skills.title":"कौशल", "memory.title":"गैलरी", "jobs.title":"नौकरी अपडेट्स",
    "map.title":"मानचित्र", "contact.title":"संपर्क"
  }
};
function applyTranslations(lang){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    const map = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    if(map[key]){
      el.innerHTML = map[key];
    }
  });
  const map = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  if(map['title']){ document.getElementById('site-title').innerText = map['title']; document.title = map['title']; }
}
document.getElementById('language-switcher').addEventListener('change', function(){ applyTranslations(this.value); });

/* ---------------------------
   CV generator (builds printable page from current DOM)
----------------------------*/
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function buildCVHtml(){
  const name = document.getElementById('profile-name').innerText;
  const meta = document.getElementById('profile-meta').innerText;
  const about = document.querySelector('#about p')?.innerText || '';
  const education = Array.from(document.querySelectorAll('#education li')).map(li=> li.innerText).join('<br>');
  const projects = Array.from(document.querySelectorAll('#projects li')).map(li=> li.innerText).join('<br>');
  const pubs = Array.from(document.querySelectorAll('#publications li')).map(li=> li.innerText).join('<br>');
  const html = `
  <html><head><title>CV - ${escapeHtml(name)}</title>
    <style>body{ font-family: Georgia, serif; padding:28px; color:#111;} h1{ font-size:26px;} h2{ font-size:18px; margin-top:18px; color:#213e63; }</style>
  </head><body>
    <h1>${escapeHtml(name)}</h1>
    <div><strong>${escapeHtml(meta)}</strong></div>
    <h2>About</h2><div>${escapeHtml(about)}</div>
    <h2>Education</h2><div>${education}</div>
    <h2>Projects</h2><div>${projects}</div>
    <h2>Publications</h2><div>${pubs}</div>
  </body></html>`;
  return html;
}
document.getElementById('cv-open').addEventListener('click', ()=>{
  const w = window.open('', '_blank');
  w.document.write(buildCVHtml());
  w.document.close();
  setTimeout(()=> w.print(), 700);
});
document.getElementById('download-cv').addEventListener('click', ()=> document.getElementById('cv-open').click());

/* ---------------------------
   Init on DOM ready
----------------------------*/
document.addEventListener('DOMContentLoaded', ()=>{
  buildYearOptions();
  renderGallery();
  seedJobs();
  renderJobs();
  applyTranslations('en'); // default
  const stored = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
  if(!isNaN(stored) && document.getElementById('view-count-footer')) document.getElementById('view-count-footer').innerText = stored;
});
