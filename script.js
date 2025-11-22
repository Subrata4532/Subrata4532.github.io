/* ---------------------------
   Configuration & keys
----------------------------*/
const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = 'subrata_gallery_final';
const JOBS_KEY = 'subrata_jobs_final';
const VIEW_KEY = 'subrata_view_count_final';

/* ---------------------------
   Loading screen
----------------------------*/
window.addEventListener('load', () => {
  setTimeout(()=> {
    const el = document.getElementById('loading-screen');
    el.style.opacity = 0;
    setTimeout(()=> el.style.display = 'none', 500);
  }, 800);
});

/* ---------------------------
   Clock & Date
----------------------------*/
function updateClock(){
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
  document.getElementById('date').innerText = now.toLocaleDateString();
}
setInterval(updateClock,1000);
updateClock();

/* ---------------------------
   Visitor counter (local)
----------------------------*/
function incrementView(){
  try{
    let v = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
    v++;
    localStorage.setItem(VIEW_KEY, String(v));
    document.getElementById('view-count-footer').innerText = v;
  }catch(e){ console.warn(e); }
}
incrementView();

/* ---------------------------
   Weather (Open-Meteo) - current + daily
   No API key needed
----------------------------*/
async function fetchWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();

    // current
    if(data.current_weather){
      document.getElementById('temperature').innerText = `${data.current_weather.temperature}°C`;
    } else {
      document.getElementById('temperature').innerText = 'N/A';
    }

    // daily summary: show next 3 days
    if(data.daily && data.daily.time){
      const times = data.daily.time;
      const maxs = data.daily.temperature_2m_max;
      const mins = data.daily.temperature_2m_min;
      let html = '<ul style="list-style:none;padding:0;margin:0;">';
      for(let i=0;i<Math.min(3,times.length);i++){
        html += `<li style="margin-bottom:6px;">${times[i]}: ${Math.round(mins[i])}° / ${Math.round(maxs[i])}°C</li>`;
      }
      html += '</ul>';
      document.getElementById('daily-weather').innerHTML = html;
    } else {
      document.getElementById('daily-weather').innerText = 'Daily forecast unavailable';
    }
  }catch(e){
    console.warn(e);
    document.getElementById('temperature').innerText = 'Weather unavailable';
    document.getElementById('daily-weather').innerText = 'Weather unavailable';
  }
}

function initWeather(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeather(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      // fallback to IIIT coords
      fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
    }, { timeout:7000 });
  } else {
    fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
  }
}
initWeather();

/* ---------------------------
   Leaflet Map
----------------------------*/
const map = L.map('map', { zoomControl:true }).setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ maxZoom:19, attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const marker = L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map);
marker.bindPopup("<strong>Indian Institute of Information Technology Allahabad</strong>").openPopup();

/* ---------------------------
   Jobs (localStorage)
----------------------------*/
function seedJobs(){
  if(localStorage.getItem(JOBS_KEY)) return;
  const seed = [
    { id: Date.now()+1, title:"Research Intern - Medical Imaging", company:"IIIT Allahabad", country:"India", type:"Intern", location:"Allahabad", date:new Date().toISOString() },
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
  const listEl = document.getElementById('job-list');
  listEl.innerHTML = '';
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
  saveJobs(jobs);
  document.getElementById('new-title').value=''; document.getElementById('new-company').value=''; document.getElementById('new-location').value='';
  renderJobs();
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
  // default to current year if in range
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
    div.innerHTML = `<img src="${it.data}" alt="img-${idx}" onclick="openModal('${it.data}')">`;
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
   Modal for gallery
----------------------------*/
function openModal(src){ document.getElementById('modal-img').src = src; document.getElementById('modal').style.display = 'flex'; }
function closeModal(e){ if(e.target.id === 'modal' || e.target.id === 'modal-content') document.getElementById('modal').style.display = 'none'; }

/* ---------------------------
   Contact (demo)
----------------------------*/
function contactFormSubmit(e){
  e.preventDefault();
  alert('Thanks! Message saved locally (demo).');
  document.getElementById('c_name').value=''; document.getElementById('c_email').value=''; document.getElementById('c_msg').value='';
  return false;
}

/* ---------------------------
   Smooth anchor scroll + active nav
----------------------------*/
document.querySelectorAll('nav.global a').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if(href && href.startsWith('#')){
      e.preventDefault();
      const target = document.querySelector(href);
      if(target){
        const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96;
        const pos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 8;
        window.scrollTo({ top: pos, behavior:'smooth' });
      }
    }
  });
});
window.addEventListener('scroll', ()=>{
  const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96;
  let current = null;
  document.querySelectorAll('section[id]').forEach(s=>{
    if(window.pageYOffset >= s.offsetTop - headerOffset - 12) current = s.id;
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
document.getElementById('theme-toggle').addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
});

/* ---------------------------
   Chatbot
----------------------------*/
const chatbotBubble = document.getElementById('chatbot-bubble');
const chatbotBox = document.getElementById('chatbot-box');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotInput = document.getElementById('chatbot-input');
const msgArea = document.getElementById('chatbot-messages');

chatbotBubble.addEventListener('click', ()=> {
  chatbotBox.style.display = chatbotBox.style.display === 'block' ? 'none' : 'block';
});
chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keypress', e => { if(e.key === 'Enter') sendMessage(); });

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
   Simple translation placeholders (EN + major languages mapping)
   (Only menu/section titles for performance)
----------------------------*/
const TRANSLATIONS = {
  en: {},
  hi: { "nav.home":"होम","nav.about":"परिचय","home.title":"स्वागत" },
  bn: { "nav.home":"হোম","nav.about":"পরিচিতি","home.title":"স্বাগতম" },
  ta: { "nav.home":"முகப்பு","nav.about":"பற்றி","home.title":"வரவேற்பு" },
  te: { "nav.home":"హోమ్","nav.about":"గురించి","home.title":"స్వాగతం" },
  mr: { "nav.home":"मुख्यपृष्ठ","nav.about":"बद्दल","home.title":"स्वागत" },
  gu: { "nav.home":"હોમ","nav.about":"વિશે","home.title":"સ્વાગત" },
  kn: { "nav.home":"ಮುಖಪುಟ","nav.about":"ಬಗ್ಗೆ","home.title":"ಸ್ವಾಗತ" },
  ml: { "nav.home":"ഹോം","nav.about":"കുറിച്ച്","home.title":"സ്വാഗതം" },
  or: { "nav.home":"ହୋମ୍","nav.about":"ବିଷୟରେ","home.title":"ସ୍ବାଗତ" },
  pa: { "nav.home":"ਹੋਮ","nav.about":"ਬਾਰੇ","home.title":"ਸੁਆਗਤ" },
  ur: { "nav.home":"ہوم","nav.about":"متعلق","home.title":"خوش آمدید" }
};

document.getElementById('language-switcher').addEventListener('change', function(){
  const lang = this.value;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
  });
});

/* ---------------------------
   Utilities
----------------------------*/
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ---------------------------
   Init on DOM ready
----------------------------*/
document.addEventListener('DOMContentLoaded', ()=>{
  // build year select (2000-3000)
  buildYearOptions();
  // render gallery & jobs
  renderGallery();
  seedJobs();
  renderJobs();
  // load stored view count
  const stored = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
  if(!isNaN(stored)) document.getElementById('view-count-footer').innerText = stored;
});
