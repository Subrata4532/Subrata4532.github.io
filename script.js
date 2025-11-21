/* ---------- CONFIG ---------- */
const PROFILE_IMG = "profile.jpg";    // path in repo root
const CALENDLY_URL = "https://calendly.com/subrata-official111/30min";
const IIIT_COORDS = {lat:25.4358, lon:81.8463}; // IIIT Allahabad

/* ---------- SET PROFILE IMAGES (if present) ---------- */
document.addEventListener("DOMContentLoaded",() => {
  document.querySelectorAll(".profile-photo img").forEach(img=>{
    if(img.getAttribute("src") === "" || img.getAttribute("src") === null) img.src = PROFILE_IMG;
  });

  // auto-year
  document.querySelectorAll(".auto-year").forEach(el => el.textContent = new Date().getFullYear());

  // live time
  function updateTime(){
    document.querySelectorAll("#live-time").forEach(el => el.textContent = new Date().toLocaleString());
  }
  updateTime();
  setInterval(updateTime,1000);

  // visitor counter (countapi.xyz)
  (function visitor(){
    const el = document.getElementById("visitor-count");
    if(!el) return;
    const ns="subrata_pramanik_site_v1", key="main_homepage";
    fetch(`https://api.countapi.xyz/hit/${ns}/${key}`)
      .then(r=>r.json()).then(j=>{
        if(j && j.value) el.textContent = j.value;
      }).catch(()=>{
        // fallback local
        let v = Number(localStorage.getItem("visits_fallback")||0)+1;
        localStorage.setItem("visits_fallback",v);
        el.textContent = v;
      });
  })();

  // weather (Open-Meteo)
  (function weather(){
    const el = document.getElementById("weather");
    if(!el) return;
    function show(obj){
      if(!obj || !obj.current_weather){ el.innerHTML = "<span style='color:#7b8f95'>Weather unavailable</span>"; return; }
      const c = obj.current_weather;
      el.innerHTML = `<strong style="color:var(--accent)">${Math.round(c.temperature)}°C</strong> • wind ${Math.round(c.windspeed)} km/h`;
    }
    // prefer geolocation
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat=pos.coords.latitude.toFixed(4), lon=pos.coords.longitude.toFixed(4);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
          .then(r=>r.json()).then(show).catch(()=>show(null));
      }, ()=> {
        // fallback to IIIT coords
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${IIIT_COORDS.lat}&longitude=${IIIT_COORDS.lon}&current_weather=true`)
          .then(r=>r.json()).then(show).catch(()=>show(null));
      }, {timeout:7000});
    } else {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${IIIT_COORDS.lat}&longitude=${IIIT_COORDS.lon}&current_weather=true`)
        .then(r=>r.json()).then(show).catch(()=>show(null));
    }
    setInterval(()=>{ /* update every 10 minutes */ }, 10*60*1000);
  })();

  // gallery populate (if grid exists)
  (function gallery(){
    const grid = document.getElementById("gallery-grid");
    if(!grid) return;
    // try to load 1..24 images in /images/
    for(let i=1;i<=24;i++){
      const path = `images/${i}.jpg`;
      const img = new Image();
      img.src = path;
      img.onload = ()=>{
        const el = document.createElement("img");
        el.src = path; el.alt = `Photo ${i}`;
        el.addEventListener("click", ()=> openLightbox(path));
        grid.appendChild(el);
      };
    }
  })();

  // lightbox
  (function lightbox(){
    const lb = document.createElement("div");
    lb.className = "lightbox"; lb.id="lightbox";
    lb.innerHTML = `<img id="lb-img" src="" alt=""/><div style="height:6px"></div>`;
    document.body.appendChild(lb);
    lb.addEventListener("click", ()=> lb.classList.remove("open"));
    window.openLightbox = (src)=>{ document.getElementById("lb-img").src = src; lb.classList.add("open"); };
    window.closeLightbox = ()=> lb.classList.remove("open");
  })();

  // accordions
  document.querySelectorAll(".accordion").forEach(acc=>{
    const head = acc.querySelector(".head");
    const body = acc.querySelector(".body");
    head.addEventListener("click",()=>{
      if(body.style.height && body.style.height !== "0px"){ body.style.height = "0px"; }
      else {
        body.style.height = body.scrollHeight + "px";
      }
    });
    // set initial collapsed
    if(body){ body.style.height = "0px"; }
  });

  // job updates system (localStorage)
  (function jobUpdates(){
    const FORM_ID = "job-form";
    const LIST_ID = "jobs-list";
    function loadJobs(){
      const raw = localStorage.getItem("jobs_v1");
      return raw ? JSON.parse(raw) : [];
    }
    function saveJobs(jobs){ localStorage.setItem("jobs_v1", JSON.stringify(jobs)); }
    function renderJobs(filter={}){
      const list = document.getElementById(LIST_ID);
      if(!list) return;
      list.innerHTML = "";
      let jobs = loadJobs();
      // filter
      if(filter.region) jobs = jobs.filter(j => j.region === filter.region);
      if(filter.level) jobs = jobs.filter(j => j.level === filter.level);
      if(filter.q) jobs = jobs.filter(j => (j.title + " " + j.company + " " + j.desc).toLowerCase().includes(filter.q.toLowerCase()));
      // sort by date desc
      jobs.sort((a,b)=> new Date(b.date) - new Date(a.date));
      if(jobs.length===0){ list.innerHTML = `<div style="color:var(--muted)">No jobs yet.</div>`; return; }
      jobs.forEach(j=>{
        const div = document.createElement("div"); div.className="job-card";
        div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
            <div><strong>${escapeHtml(j.title)}</strong> <span style="color:var(--muted)">— ${escapeHtml(j.company)}</span></div>
            <div style="font-size:0.9rem;color:var(--muted)">${new Date(j.date).toLocaleDateString()}</div>
          </div>
          <div style="margin-top:6px">${escapeHtml(j.desc)}</div>
          <div class="job-meta">Region: ${j.region} • Level: ${j.level} • <a href="${j.link}" target="_blank">Link</a></div>`;
        list.appendChild(div);
      });
    }
    // helper escape
    function escapeHtml(s){ return (s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
    // hook form
    const form = document.getElementById(FORM_ID);
    if(form){
      form.addEventListener("submit", e=>{
        e.preventDefault();
        const data = {
          title: form.querySelector("[name=title]").value.trim(),
          company: form.querySelector("[name=company]").value.trim(),
          link: form.querySelector("[name=link]").value.trim(),
          region: form.querySelector("[name=region]").value,
          level: form.querySelector("[name=level]").value,
          desc: form.querySelector("[name=desc]").value.trim(),
          date: new Date().toISOString()
        };
        const jobs = loadJobs(); jobs.push(data); saveJobs(jobs);
        form.reset(); renderJobs({});
      });
    }
    // hook filters if present
    const regionSel = document.getElementById("filter-region");
    const levelSel = document.getElementById("filter-level");
    const qInput = document.getElementById("filter-q");
    if(regionSel){ regionSel.addEventListener("change", ()=> renderJobs({region:regionSel.value || null, level: levelSel ? levelSel.value : null, q:qInput? qInput.value : "" })); }
    if(levelSel){ levelSel.addEventListener("change", ()=> renderJobs({region:regionSel.value || null, level: levelSel.value || null, q:qInput? qInput.value : "" })); }
    if(qInput){ qInput.addEventListener("input", ()=> renderJobs({region:regionSel?regionSel.value:null, level:levelSel?levelSel.value:null, q:qInput.value })); }

    // initial render
    renderJobs({});
  })();

  // small copy-protect: disable context menu and selection on main content (not perfect but a deterrent)
  document.addEventListener("contextmenu", (e)=> {
    // allow on inputs
    if(e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "A") return;
    e.preventDefault();
  });
  document.body.classList.add("no-select");
});
