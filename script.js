/* script.js - background slideshow, accordion, live time, weather, visitor counter, gallery & job updates */

/* -------- CONFIG -------- */
const BG_IMAGES = [
  "/bg1.jpg", // upload bg1.jpg to repo root (your beach image)
  "/bg2.jpg", // upload bg2.jpg to repo root (your second background)
  "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=60"
];
const PROFILE_IMG = "/profile.jpg"; // upload profile.jpg to repo root
const GALLERY_FOLDER = "/images/"; // upload gallery images here
const CALENDLY_LINK = "https://calendly.com/subrata-official111/30min";
const VISITOR_NAMESPACE = "subrata_pramanik_profile";
const VISITOR_KEY = "main_site_v1";

/* -------- BACKGROUND SLIDESHOW -------- */
(function(){
  let i = 0;
  function setBg(url){
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }
  function attemptSet(img){
    const t = new Image();
    t.onload = ()=> setBg(img);
    t.onerror = ()=> setBg(BG_IMAGES[BG_IMAGES.length-1]);
    t.src = img;
  }
  attemptSet(BG_IMAGES[0]);
  setInterval(()=> {
    i = (i+1) % BG_IMAGES.length;
    attemptSet(BG_IMAGES[i]);
  }, 8000);
})();

/* -------- AUTO-YEAR and PROFILE image fallback -------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".auto-year").forEach(el => el.textContent = new Date().getFullYear());
  // replace profile images if any
  document.querySelectorAll('img[data-profile="true"]').forEach(img=>{
    img.onerror = ()=> { img.src = PROFILE_IMG; };
  });
});

/* -------- LIVE TIME -------- */
function updateTime(){
  const el = document.getElementById('live-time');
  if(el) el.textContent = new Date().toLocaleString();
}
updateTime(); setInterval(updateTime, 1000);

/* -------- VISITOR COUNTER -------- */
function updateVisitor(){
  const el = document.getElementById('visitor-count');
  if(!el) return;
  fetch(`https://api.countapi.xyz/hit/${VISITOR_NAMESPACE}/${VISITOR_KEY}`)
    .then(r=>r.json()).then(j=> { if(j && j.value) el.textContent = j.value; })
    .catch(()=> {
      const k = 'vis_local_' + VISITOR_KEY;
      let v = Number(localStorage.getItem(k) || 0) + 1;
      localStorage.setItem(k, v);
      el.textContent = v;
    });
}
updateVisitor();

/* -------- WEATHER (Open-Meteo) -------- */
function showWeather(obj){
  const el = document.getElementById('weather');
  if(!el) return;
  if(!obj || !obj.current_weather){ el.innerHTML = `<span style="color:#6b7880">Weather unavailable</span>`; return; }
  const c = obj.current_weather;
  el.innerHTML = `<strong style="color:var(--accent)">${Math.round(c.temperature)}°C</strong> — wind ${Math.round(c.windspeed)} km/h`;
}
function getWeather(){
  if(!navigator.geolocation){
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
    return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const lat = pos.coords.latitude.toFixed(4), lon = pos.coords.longitude.toFixed(4);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    fetch(url).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
  }, ()=> {
    const fallback = `https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`;
    fetch(fallback).then(r=>r.json()).then(showWeather).catch(()=>showWeather(null));
  }, {timeout:8000});
}
getWeather(); setInterval(getWeather, 10*60*1000);

/* -------- ACCORDION BEHAVIOR (global) -------- */
document.addEventListener('click', function(e){
  const hdr = e.target.closest('.accordion-header');
  if(!hdr) return;
  const item = hdr.closest('.accordion-item');
  const body = item.querySelector('.accordion-body');
  const open = body.classList.contains('open');
  // close other accordion bodies inside same container (optional single-open)
  const container = item.closest('.accordion');
  if(container){
    container.querySelectorAll('.accordion-body.open').forEach(b=>{
      if(b !== body) b.classList.remove('open');
    });
  }
  if(open) body.classList.remove('open'); else body.classList.add('open');
});

/* -------- GALLERY LIGHTBOX -------- */
(function(){
  const lb = document.createElement("div");
  lb.className = "lightbox"; lb.id = "lightbox";
  lb.innerHTML = `<img id="lb-img" src="" alt="img">`;
  document.body.appendChild(lb);
  lb.addEventListener("click", ()=> lb.classList.remove("open"));
  window.openLightbox = function(src){ document.getElementById("lb-img").src = src; lb.classList.add("open"); };
})();

/* -------- POPULATE GALLERY IF GRID EXISTS -------- */
(function(){
  const grid = document.getElementById("gallery-grid");
  if(!grid) return;
  for(let i=1;i<=24;i++){
    const path = `${GALLERY_FOLDER}${i}.jpg`;
    const img = new Image(); img.src = path;
    img.onload = ()=> {
      const el = document.createElement('img'); el.src = path; el.alt = `Photo ${i}`;
      el.addEventListener('click', ()=> openLightbox(path));
      grid.appendChild(el);
    };
  }
})();

/* -------- SIMPLE ANTI-COPY -------- */
document.addEventListener('copy', (e)=>{
  const selection = window.getSelection().toString();
  if(selection.length > 300) {
    e.preventDefault();
    alert("Copying large sections is disabled on this page.");
  }
});

/* -------- JOB UPDATES functions (if jobupdates page is loaded) -------- */
(function(){
  const LS_KEY = "job_updates_v1";
  function uid(){ return 'j_'+Date.now()+'_'+Math.floor(Math.random()*9999); }
  function loadJobs(){ try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch(e){ return []; } }
  function saveJobs(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

  if(!document.getElementById('job-list')) return; // not on page
  const elList = document.getElementById('job-list');
  const noJobs = document.getElementById('no-jobs');

  function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }

  function renderJobCard(job){
    const el = document.createElement('div'); el.className = 'job-card';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div style="flex:1">
          <h3>${escapeHtml(job.title)} — <small style="color:var(--muted)">${escapeHtml(job.company)}</small></h3>
          <div class="job-meta">${escapeHtml(job.location)} • ${escapeHtml(job.country)} • ${escapeHtml(job.level)} • ${escapeHtml(job.type)} • <em style="color:var(--muted)">${job.date || ''}</em></div>
          <div style="color:#1b2b2b">${escapeHtml(job.desc)}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          ${ job.apply ? `<a class="btn" href="${encodeURI(job.apply)}" target="_blank" rel="noopener">Apply</a>` : '' }
          <button class="btn secondary" data-id="${job.id}" aria-label="Delete job">Delete</button>
        </div>
      </div>
    `;
    el.querySelector('button[data-id]')?.addEventListener('click', (e)=>{
      if(!confirm('Delete this job?')) return;
      const id = e.currentTarget.getAttribute('data-id');
      const arr = loadJobs().filter(x=>x.id !== id);
      saveJobs(arr); renderJobs();
    });
    return el;
  }

  function renderJobs(){
    const all = loadJobs();
    const q = (document.getElementById('job-search').value || '').toLowerCase().trim();
    const country = document.getElementById('filter-country').value;
    const level = document.getElementById('filter-level').value;
    const type = document.getElementById('filter-type').value;

    let filtered = all.filter(job=>{
      if(country !== 'all' && job.country !== country) return false;
      if(level !== 'all' && job.level !== level) return false;
      if(type !== 'all' && job.type !== type) return false;
      if(q){
        const hay = (job.company + ' ' + job.title + ' ' + job.location + ' ' + job.desc).toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });

    elList.innerHTML = '';
    if(filtered.length === 0){
      noJobs.style.display = 'block';
    } else {
      noJobs.style.display = 'none';
      filtered.sort((a,b)=> (b.created || 0) - (a.created || 0));
      filtered.forEach(job=> elList.appendChild(renderJobCard(job)));
    }
  }

  // modal and handlers
  const modal = document.getElementById('modal');
  document.getElementById('open-add').addEventListener('click', ()=> {
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    ['job-company','job-title','job-location','job-desc','job-apply','job-date'].forEach(id=>document.getElementById(id).value = '');
    document.getElementById('job-country').value = 'India';
    document.getElementById('job-level').value = 'Internship';
    document.getElementById('job-type').value = 'Full-time';
  });
  document.getElementById('cancel-job').addEventListener('click', ()=> { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); });

  document.getElementById('save-job').addEventListener('click', ()=>{
    const company = document.getElementById('job-company').value.trim();
    const title = document.getElementById('job-title').value.trim();
    const location = document.getElementById('job-location').value.trim();
    const country = document.getElementById('job-country').value;
    const level = document.getElementById('job-level').value;
    const type = document.getElementById('job-type').value;
    const apply = document.getElementById('job-apply').value.trim();
    const desc = document.getElementById('job-desc').value.trim().slice(0,400);
    const date = document.getElementById('job-date').value;

    if(!company || !title){ alert('Please enter company and role/title.'); return; }

    const arr = loadJobs();
    const job = { id: uid(), company, title, location, country, level, type, apply, desc, date, created: Date.now() };
    arr.push(job); saveJobs(arr);
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); renderJobs();
  });

  ['filter-country','filter-level','filter-type','job-search'].forEach(id=>{
    document.getElementById(id).addEventListener('input', renderJobs);
  });
  document.getElementById('clear-filters').addEventListener('click', ()=>{
    document.getElementById('filter-country').value = 'all';
    document.getElementById('filter-level').value = 'all';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('job-search').value = '';
    renderJobs();
  });

  renderJobs();

  // optional export/import
  window.jobUpdatesExport = function(){
    const d = loadJobs();
    const blob = new Blob([JSON.stringify(d, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'job_updates_export.json'; a.click();
    URL.revokeObjectURL(url);
  };
  window.jobUpdatesImport = function(json){
    try{ const arr = JSON.parse(json); if(Array.isArray(arr)){ saveJobs(arr); renderJobs(); alert('Imported ' + arr.length + ' jobs.'); } else alert('Invalid JSON'); }catch(e){ alert('Invalid JSON'); }
  };

})();
