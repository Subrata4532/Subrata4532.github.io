/* Final script.js
   - Adds: fixed issues, themes, full clock, ticker, gallery (2000-3000), 7-day weather,
           map, CV generator, jobs, smooth nav + active highlight, chat, visitor counter.
*/

/* Developer note: uploaded file path (kept as comment per tooling)
/mnt/data/Assignment_11.pdf
*/

/* ---------------------------
   Config
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
    if(!el) return;
    el.style.opacity = 0;
    setTimeout(()=> el.style.display = 'none', 500);
  }, 700);
});

/* ---------------------------
   Clock, date, day (full format for top-right)
----------------------------*/
function updateClock(){
  const now = new Date();
  document.getElementById('clock').innerText = now.toLocaleTimeString();
  document.getElementById('date').innerText = now.toLocaleDateString();
  document.getElementById('dayname').innerText = now.toLocaleDateString(undefined, { weekday: 'long' });

  // Top-right full format: Saturday | 23 Nov 2025 | 10:42:11 PM
  const optsDay = { weekday:'long' };
  const optsDate = { day:'2-digit', month:'short', year:'numeric' };
  const day = now.toLocaleDateString(undefined, optsDay);
  const date = now.toLocaleDateString(undefined, optsDate);
  const time = now.toLocaleTimeString();
  const top = document.getElementById('top-right-clock');
  if(top) top.innerText = `${day} | ${date} | ${time}`;
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
    const el = document.getElementById('view-count-footer');
    if(el) el.innerText = v;
  }catch(e){ console.warn(e); }
}
incrementView();

/* ---------------------------
   Weather: Open-Meteo 7-day
----------------------------*/
async function fetchWeather(lat, lon){
  try{
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const res = await fetch(url);
    if(!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();

    if(data.current_weather){
      const el = document.getElementById('temperature');
      if(el) el.innerText = `${data.current_weather.temperature}°C`;
    }

    if(data.daily && data.daily.time){
      const times = data.daily.time;
      const maxs = data.daily.temperature_2m_max;
      const mins = data.daily.temperature_2m_min;
      const dailyEl = document.getElementById('daily-weather');
      if(dailyEl){
        let html = '<ul style="list-style:none;padding:0;margin:0;">';
        for(let i=0;i<Math.min(7,times.length);i++){
          const short = new Date(times[i]).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
          html += `<li style="margin-bottom:6px;">${short}: ${Math.round(mins[i])}° / ${Math.round(maxs[i])}°C</li>`;
        }
        html += '</ul>';
        dailyEl.innerHTML = html;
      }
      const pf = document.getElementById('daily-forecast');
      if(pf) pf.innerText = `${Math.round(mins[0])}° / ${Math.round(maxs[0])}°C (today)`;
    }

  } catch(e){
    console.warn(e);
    if(document.getElementById('daily-weather')) document.getElementById('daily-weather').innerText = 'Weather unavailable';
    if(document.getElementById('temperature')) document.getElementById('temperature').innerText = 'N/A';
  }
}

function initWeather(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos => { fetchWeather(pos.coords.latitude, pos.coords.longitude); }, err => { fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon); }, { timeout:7000 });
  } else {
    fetchWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
  }
}
initWeather();

/* ---------------------------
   Leaflet map
----------------------------*/
const map = L.map('map', { zoomControl:true }).setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap contributors' }).addTo(map);
const marker = L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map);
marker.bindPopup("<strong>Indian Institute Of Information Technology</strong>").openPopup();
marker.bindTooltip("Indian Institute Of Information Technology", {direction:"top", offset:[0,-8]});

/* ---------------------------
   Jobs localStorage
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
  const listEl = document.getElementById('job-list');
  listEl.innerHTML = '';
  if(filtered.length === 0){ listEl.innerHTML = "<div class='small'>No job updates.</div>"; return; }
  filtered.forEach(j=>{
    const div = document.createElement('div'); div.className = 'job-card';
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
  saveJobs(jobs); document.getElementById('new-title').value=''; document.getElementById('new-company').value=''; document.getElementById('new-location').value='';
  renderJobs();
}
function removeJob(id){ if(!confirm('Remove this job?')) return; saveJobs(readJobs().filter(j=> j.id !== id)); renderJobs(); }
function clearJobs(){ if(!confirm('Clear all job postings?')) return; localStorage.removeItem(JOBS_KEY); seedJobs(); renderJobs(); }

/* ---------------------------
   Gallery 2000-3000
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
    const added = new Date(it.added);
    const day = added.toLocaleDateString(undefined,{weekday:'long'});
    const time = added.toLocaleTimeString();
    const dateStr = added.toLocaleDateString();
    div.innerHTML = `<img src="${it.data}" alt="img-${idx}" onclick="openModal('${it.data}')"><div class="gallery-meta">${day}, ${dateStr} — ${time}</div>`;
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
    document.getElementById('image-file').value = '';
  };
  reader.readAsDataURL(f);
}
function clearGallery(){ if(!confirm('Clear gallery?')) return; localStorage.removeItem(GALLERY_KEY); renderGallery(); }

/* ---------------------------
   Modal
----------------------------*/
function openModal(src){ document.getElementById('modal-img').src = src; document.getElementById('modal').style.display = 'flex'; document.getElementById('modal').setAttribute('aria-hidden','false'); }
function closeModal(e){ if(!e || e.target.id === 'modal' || e.target.id === 'modal-content'){ document.getElementById('modal').style.display = 'none'; document.getElementById('modal').setAttribute('aria-hidden','true'); } }

/* ---------------------------
   Contact (demo)
----------------------------*/
function contactFormSubmit(e){ e.preventDefault(); alert('Thanks! Message saved locally (demo).'); document.getElementById('c_name').value=''; document.getElementById('c_email').value=''; document.getElementById('c_msg').value=''; return false; }

/* ---------------------------
   Smooth anchors + active nav
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
function applyTheme(theme){
  if(theme === 'dark') document.body.classList.add('dark-mode');
  else document.body.classList.remove('dark-mode');
  localStorage.setItem('site_theme', theme);
}
themeToggle.addEventListener('click', ()=> {
  const isDark = document.body.classList.toggle('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('site_theme', isDark ? 'dark' : 'light');
});
const savedTheme = localStorage.getItem('site_theme') || 'light';
applyTheme(savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

/* ---------------------------
   Chatbot (simple)
----------------------------*/
const chatbotBubble = document.getElementById('chatbot-bubble');
const chatbotBox = document.getElementById('chatbot-box');
const chatbotSend = document.getElementById('chatbot-send');
const chatbotInput = document.getElementById('chatbot-input');
const msgArea = document.getElementById('chatbot-messages');

chatbotBubble?.addEventListener('click', ()=> {
  const shown = chatbotBox.style.display === 'block';
  chatbotBox.style.display = shown ? 'none' : 'block';
  chatbotBox.setAttribute('aria-hidden', shown ? 'true' : 'false');
});
chatbotSend?.addEventListener('click', sendMessage);
chatbotInput?.addEventListener('keypress', e=> { if(e.key === 'Enter') sendMessage(); });

function sendMessage(){
  const text = chatbotInput.value?.trim();
  if(!text) return;
  msgArea.innerHTML += `<div class="chatbot-msg user">${escapeHtml(text)}</div>`;
  chatbotInput.value = '';
  setTimeout(()=> { msgArea.innerHTML += `<div class="chatbot-msg bot">Thanks — I received: ${escapeHtml(text)}</div>`; msgArea.scrollTop = msgArea.scrollHeight; }, 400);
}

/* ---------------------------
   Language mapping (basic)
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
   Auto CV generator (HTML -> print dialog)
----------------------------*/
function buildCVHtml(){
  const name = document.getElementById('profile-name')?.innerText || 'Subrata Pramanik';
  const meta = document.getElementById('profile-meta')?.innerText.replace(/\n/g, ', ') || 'Junior Research Fellow, Indian Institute Of Information Technology';
  const skills = document.getElementById('skills-list')?.innerText || '';
  const pubs = Array.from(document.querySelectorAll('#pub-list li')).map(li => li.innerText);
  const projs = Array.from(document.querySelectorAll('#proj-list li')).map(li => li.innerText);
  const awards = Array.from(document.querySelectorAll('#awards-list li')).map(li => li.innerText);
  const education = Array.from(document.querySelectorAll('#education-list li')).map(li => li.innerText);
  const experience = Array.from(document.querySelectorAll('#experience-list li')).map(li => li.innerText);

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>CV - ${escapeHtml(name)}</title>
    <style>
      body{ font-family: Georgia, serif; padding:28px; color:#111; }
      h1{ font-size:28px; margin-bottom:6px; }
      h2{ font-size:16px; margin-top:18px; color:#2b5fa8; }
      .meta{ color:#666; margin-bottom:12px; }
      ul{ margin-top:6px; }
      .small{ color:#666; font-size:13px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(name)}</h1>
    <div class="meta">${escapeHtml(meta)}</div>

    <h2>Education</h2>
    <ul>${education.map(e=>`<li>${escapeHtml(e)}</li>`).join('')}</ul>

    <h2>Experience</h2>
    <ul>${experience.map(e=>`<li>${escapeHtml(e)}</li>`).join('')}</ul>

    <h2>Skills</h2>
    <div>${escapeHtml(skills)}</div>

    <h2>Projects</h2>
    <ul>${projs.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul>

    <h2>Publications</h2>
    <ol>${pubs.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ol>

    <h2>Awards & Honours</h2>
    <ul>${awards.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul>

    <hr>
    <div class="small">Generated from this website — ${new Date().toLocaleString()}</div>
  </body>
  </html>
  `;
  return html;
}

document.getElementById('generate-cv').addEventListener('click', ()=>{
  const w = window.open('', '_blank');
  w.document.open();
  w.document.write(buildCVHtml());
  w.document.close();
  setTimeout(()=> { try{ w.print(); } catch(e){ console.warn(e); } }, 600);
});

/* ---------------------------
   Utilities & init
----------------------------*/
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('DOMContentLoaded', ()=>{
  buildYearOptions();
  renderGallery();
  seedJobs();
  renderJobs();
  // show stored view count
  const stored = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
  if(!isNaN(stored)) document.getElementById('view-count-footer').innerText = stored;
});
