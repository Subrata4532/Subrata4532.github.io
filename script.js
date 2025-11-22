/* Ultra-clean script.js
   Jobs: empty by default, add via form. Filters: work type, experience, country.
*/

const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = 'subrata_gallery_final';
const JOBS_KEY = 'subrata_jobs_final';
const VIEW_KEY = 'subrata_view_count_final';

/* Loading */
window.addEventListener('load', () => {
  const load = document.getElementById('loading-screen');
  if (!load) return;
  setTimeout(() => { load.style.opacity = '0'; setTimeout(() => load.style.display = 'none', 600); }, 500);
});

/* Clock */
function updateClock(){
  const now = new Date();
  const t = now.toLocaleTimeString();
  const d = now.toLocaleDateString();
  const day = now.toLocaleDateString(undefined,{weekday:'long'});
  document.getElementById('clock')?.innerText = t;
  document.getElementById('date')?.innerText = d;
  document.getElementById('dayname')?.innerText = day;
  document.getElementById('top-time')?.innerText = t;
  document.getElementById('top-date')?.innerText = d;
  document.getElementById('top-day')?.innerText = day;
}
updateClock(); setInterval(updateClock,1000);

/* Visitor counter */
(function(){
  try{
    let v = parseInt(localStorage.getItem(VIEW_KEY) || '0',10);
    v = isNaN(v) ? 1 : v+1;
    localStorage.setItem(VIEW_KEY,String(v));
    const el = document.getElementById('view-count-footer'); if(el) el.innerText = v;
  }catch(e){console.warn(e);}
})();

/* Helpers */
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function readJobs(){ try{ return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]'); }catch(e){ return []; } }
function writeJobs(list){ localStorage.setItem(JOBS_KEY, JSON.stringify(list)); }

/* Add Job (form) */
function addJob(){
  const title = (document.getElementById('new-title')?.value || '').trim();
  const company = (document.getElementById('new-company')?.value || '').trim();
  const country = (document.getElementById('new-country')?.value || '').trim();
  const employmentType = (document.getElementById('new-employmenttype')?.value || '').trim();
  const workType = (document.getElementById('new-worktype')?.value || '').trim(); // Remote/Hybrid/On-site
  const expLevel = (document.getElementById('new-explevel')?.value || '').trim();   // Fresher/Early/Mid/Experienced
  const location = (document.getElementById('new-location')?.value || '').trim();

  if(!title || !company){ alert('Please enter title and company'); return; }

  const jobs = readJobs();
  jobs.unshift({
    id: Date.now(),
    title, company, country, employmentType, workType, expLevel, location,
    date: new Date().toISOString()
  });
  writeJobs(jobs);
  renderJobs();
  // clear form
  document.getElementById('new-title').value=''; document.getElementById('new-company').value=''; document.getElementById('new-location').value='';
}

/* Clear all jobs (confirm) */
function clearJobs(){
  if(!confirm('Clear all job postings?')) return;
  localStorage.removeItem(JOBS_KEY);
  renderJobs();
}

/* Render jobs with filters */
function renderJobs(){
  const all = readJobs().sort((a,b)=> new Date(b.date)-new Date(a.date));
  const workFilter = document.getElementById('filter-worktype')?.value || '';
  const expFilter = document.getElementById('filter-experience')?.value || '';
  const countryFilter = document.getElementById('filter-country')?.value || '';
  const search = (document.getElementById('job-search')?.value || '').toLowerCase().trim();

  let filtered = all.filter(j => {
    if(workFilter && String(j.workType || '').toLowerCase() !== workFilter.toLowerCase()) return false;
    if(expFilter && String(j.expLevel || '').toLowerCase() !== expFilter.toLowerCase()) return false;
    if(countryFilter){
      const c = (j.country || '').toLowerCase();
      if(countryFilter.toLowerCase() === 'other'){
        if(c === 'india' || c === 'usa' || c === '') return false;
      } else {
        if(c !== countryFilter.toLowerCase()) return false;
      }
    }
    if(search){
      const hay = ((j.title||'') + ' ' + (j.company||'') + ' ' + (j.location||'')).toLowerCase();
      if(!hay.includes(search)) return false;
    }
    return true;
  });

  const el = document.getElementById('job-list'); if(!el) return;
  el.innerHTML = '';
  if(filtered.length === 0){ el.innerHTML = '<div class="small">No job updates.</div>'; return; }

  filtered.forEach(j => {
    const div = document.createElement('div'); div.className = 'job-card';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="flex:1">
          <div style="font-weight:700">${escapeHtml(j.title)}</div>
          <div class="small">${escapeHtml(j.company)} • ${escapeHtml(j.location || '')} • <span class="small">${new Date(j.date).toLocaleDateString()}</span></div>
          <div style="margin-top:8px;">
            <span class="pill">${escapeHtml(j.employmentType || '')}</span>
            <span style="margin-left:6px;" class="small">${escapeHtml(j.workType || '')}</span>
            <span style="margin-left:6px;" class="small">[${escapeHtml(j.expLevel || '')}]</span>
            <span style="margin-left:6px;" class="small">${escapeHtml(j.country || '')}</span>
          </div>
        </div>
        <div style="margin-left:12px;">
          <button onclick="removeJob(${j.id})" style="padding:6px 8px;border-radius:8px;border:1px solid #eee;background:#fff;cursor:pointer">Remove</button>
        </div>
      </div>`;
    el.appendChild(div);
  });
}

/* Remove single job */
function removeJob(id){
  if(!confirm('Remove this job?')) return;
  const jobs = readJobs().filter(j=> j.id !== id);
  writeJobs(jobs);
  renderJobs();
}

/* Gallery */
function buildYearOptions(){
  const sel = document.getElementById('year-select');
  if(!sel) return;
  sel.innerHTML='';
  const cy = new Date().getFullYear();
  for(let y=2000;y<=2050;y++){ const o = document.createElement('option'); o.value = y; o.textContent = y; sel.appendChild(o); }
  if(cy>=2000 && cy<=2050) sel.value = cy;
}
buildYearOptions();

function loadGallery(){ try{return JSON.parse(localStorage.getItem(GALLERY_KEY) || '[]');}catch(e){return[];} }
function saveGallery(list){ localStorage.setItem(GALLERY_KEY, JSON.stringify(list)); }

function renderGallery(){
  const sel = document.getElementById('year-select'); if(!sel) return;
  const year = sel.value;
  const grid = document.getElementById('gallery-grid'); if(!grid) return;
  const items = loadGallery().filter(it => it.year === String(year));
  grid.innerHTML='';
  if(items.length === 0){ grid.innerHTML = `<div class="small">No images for ${year}.</div>`; return; }
  items.forEach((it, idx) => {
    const d = document.createElement('div'); d.className = 'gallery-item';
    d.innerHTML = `<img src="${it.data}" alt="img-${idx}" onclick="openModal('${it.data}')" /><div class="small" style="padding:6px;">Added: ${new Date(it.added).toLocaleString()}</div>`;
    grid.appendChild(d);
  });
}
document.getElementById('year-select')?.addEventListener('change', renderGallery);
renderGallery();

function addGalleryImage(){
  const f = document.getElementById('image-file')?.files?.[0]; if(!f){ alert('Select an image'); return; }
  const year = document.getElementById('year-select')?.value || String(new Date().getFullYear());
  const reader = new FileReader();
  reader.onload = e => { const arr = loadGallery(); arr.unshift({ year:String(year), data:e.target.result, added:new Date().toISOString() }); saveGallery(arr); renderGallery(); };
  reader.readAsDataURL(f);
}
function clearGallery(){ if(!confirm('Clear gallery?')) return; localStorage.removeItem(GALLERY_KEY); renderGallery(); }

/* Modal */
function openModal(src){ const m=document.getElementById('modal'); if(!m) return; document.getElementById('modal-img').src = src; m.style.display='flex'; }
function closeModal(e){ if(!e || e.target.id === 'modal' || e.target.id === 'modal-content') document.getElementById('modal').style.display='none'; }

/* Contact form demo */
function contactFormSubmit(e){ e.preventDefault(); alert('Thanks! Message saved locally (demo).'); document.getElementById('c_name').value=''; document.getElementById('c_email').value=''; document.getElementById('c_msg').value=''; return false; }

/* Smooth scroll + nav highlight */
document.querySelectorAll('nav.global a').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if(href && href.startsWith('#')){ e.preventDefault(); const target=document.querySelector(href); if(!target) return; const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96; const pos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset - 12; window.scrollTo({ top: pos, behavior:'smooth' }); }
  });
});
window.addEventListener('scroll', ()=>{
  const headerOffset = document.getElementById('site-header')?.getBoundingClientRect().height || 96;
  let current = null;
  document.querySelectorAll('section[id]').forEach(s=>{ if(window.pageYOffset >= s.offsetTop - headerOffset - 20) current = s.id; });
  document.querySelectorAll('nav.global a').forEach(a=> a.classList.remove('active'));
  if(current){ const link = document.querySelector(`nav.global a[href="#${current}"]`); if(link) link.classList.add('active'); }
});

/* Theme toggle */
document.getElementById('theme-toggle')?.addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
  document.getElementById('theme-toggle').textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});

/* Chatbot */
document.getElementById('chatbot-bubble')?.addEventListener('click', ()=>{
  const box = document.getElementById('chatbot-box'); if(!box) return; const show = box.style.display !== 'block'; box.style.display = show ? 'block' : 'none'; box.setAttribute('aria-hidden', show ? 'false' : 'true');
});
document.getElementById('chatbot-send')?.addEventListener('click', sendMessage);
document.getElementById('chatbot-input')?.addEventListener('keypress', e=>{ if(e.key === 'Enter') sendMessage(); });
function sendMessage(){ const input = document.getElementById('chatbot-input'); const txt = input?.value?.trim(); if(!txt) return; const area = document.getElementById('chatbot-messages'); area.innerHTML += `<div class="chatbot-msg user">${escapeHtml(txt)}</div>`; input.value=''; setTimeout(()=>{ area.innerHTML += `<div class="chatbot-msg bot">Thanks — I received: ${escapeHtml(txt)}</div>`; area.scrollTop = area.scrollHeight; }, 400); }

/* Location + Weather (user) */
async function reverseGeocode(lat,lon){
  try{ const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`); const data = await res.json(); const a = data.address || {}; const city = a.city||a.town||a.village||a.suburb||''; const state = a.state||''; const country = a.country||''; document.getElementById('top-location') && (document.getElementById('top-location').innerText = [city,state,country].filter(Boolean).join(', ')); }catch(e){ console.warn(e); document.getElementById('top-location') && (document.getElementById('top-location').innerText = 'Location unavailable'); }
}
async function fetchUserWeather(lat,lon){ try{ const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`); const d = await res.json(); if(d.current_weather) document.getElementById('temperature') && (document.getElementById('temperature').innerText = Math.round(d.current_weather.temperature)+'°C'); }catch(e){console.warn(e);} }
function initUserLocation(){ if(!navigator.geolocation){ document.getElementById('top-location') && (document.getElementById('top-location').innerText='Geolocation not supported'); return; } navigator.geolocation.getCurrentPosition(async pos=>{ const lat=pos.coords.latitude, lon=pos.coords.longitude; await reverseGeocode(lat,lon); fetchUserWeather(lat,lon); try{ if(document.getElementById('user-map') && typeof L !== 'undefined'){ const m = L.map('user-map',{zoomControl:false,attributionControl:false}).setView([lat,lon],12); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m); L.marker([lat,lon]).addTo(m); } }catch(e){} }, err=>{ document.getElementById('top-location') && (document.getElementById('top-location').innerText='Location blocked'); }, {timeout:7000}); }
initUserLocation();

/* Weekly weather (IIIT fallback) */
async function fetchWeeklyWeather(lat=IIIT_COORDS.lat,lon=IIIT_COORDS.lon){
  try{ const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`); const d = await res.json(); if(d.daily && d.daily.time){ const times = d.daily.time, maxs = d.daily.temperature_2m_max, mins = d.daily.temperature_2m_min; let html = '<ul style="list-style:none;padding:0">'; for(let i=0;i<Math.min(times.length,7);i++){ const dt=new Date(times[i]); html += `<li>${dt.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}: ${Math.round(mins[i])}° / ${Math.round(maxs[i])}°C</li>`; } html += '</ul>'; document.getElementById('daily-weather') && (document.getElementById('daily-weather').innerHTML = html); } }catch(e){ console.warn(e); document.getElementById('daily-weather') && (document.getElementById('daily-weather').innerText = 'Weather unavailable'); } }
fetchWeeklyWeather();

/* IIIT map init (kept) */
(function(){ try{ if(typeof L === 'undefined') return; if(!document.getElementById('map')) return; const m = L.map('map').setView([IIIT_COORDS.lat,IIIT_COORDS.lon],11); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m); L.marker([IIIT_COORDS.lat,IIIT_COORDS.lon]).addTo(m).bindPopup('<strong>IIIT Allahabad</strong>'); }catch(e){console.warn(e);} })();

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', ()=>{ buildYearOptions(); renderGallery(); renderJobs(); });
