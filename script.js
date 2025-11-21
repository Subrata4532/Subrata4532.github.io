/* script.js
 - Live time, visitor counter, weather (Open-Meteo), gallery lightbox, background loader, simple accordions.
 - Edit constants below if you uploaded images with different names.
*/

const CONFIG = {
  // Local background (upload to repo root as bg1.jpg) - change to '/bg1.jpg' after uploading
  LOCAL_BG: '/bg1.jpg', // <-- on GitHub put bg1.jpg in repo root
  PROFILE_IMG: '/profile.jpg', // upload profile.jpg to repo root
  CALENDLY_URL: 'https://calendly.com/subrata-official111/30min',
  VISITOR_NAMESPACE: 'subrata_pramanik_site',
  VISITOR_KEY: 'main_page'
};

/* ---------- background loader ---------- */
(function setBackground(){
  const url = CONFIG.LOCAL_BG;
  const img = new Image();
  img.onload = ()=> {
    document.body.style.backgroundImage = `url("${url}")`;
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundSize = 'cover';
  }
  img.onerror = ()=> {
    // fallback unsplash
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?light,sky')";
  }
  img.src = url;
})();

/* ---------- insert profile images into any page that has .profile img elements ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  document.querySelectorAll('.profile img').forEach(img=>{
    if(img.getAttribute('src') === '' || img.getAttribute('src') === null){
      img.src = CONFIG.PROFILE_IMG;
    }
  });

  // set year auto
  document.querySelectorAll('.auto-year').forEach(el => el.textContent = new Date().getFullYear());

  // live time
  function updateTime(){
    const el = document.getElementById('live-time');
    if(el) el.textContent = new Date().toLocaleString();
  }
  updateTime();
  setInterval(updateTime, 1000);

  // visitor counter (countapi.xyz)
  (function visitor(){
    const el = document.getElementById('visitor-count');
    if(!el) return;
    fetch(`https://api.countapi.xyz/hit/${CONFIG.VISITOR_NAMESPACE}/${CONFIG.VISITOR_KEY}`)
      .then(r=>r.json()).then(j=>{
        if(j && j.value) el.textContent = j.value;
      }).catch(()=> {
        const localKey='vis_local_v1';
        let v = Number(localStorage.getItem(localKey) || 0) + 1;
        localStorage.setItem(localKey, v);
        el.textContent = v;
      });
  })();

  // weather (open-meteo)
  (function weather(){
    const el = document.getElementById('weather');
    if(!el) return;
    function show(obj){
      if(!obj || !obj.current_weather) { el.innerHTML = '<span class="muted">Weather unavailable</span>'; return; }
      const c = obj.current_weather;
      el.innerHTML = `<strong>${Math.round(c.temperature)}°C</strong> • wind ${Math.round(c.windspeed)} km/h`;
    }
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        const lat = pos.coords.latitude.toFixed(4), lon = pos.coords.longitude.toFixed(4);
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
          .then(r=>r.json()).then(show).catch(()=> show(null));
      }, ()=> {
        // fallback to IIIT Allahabad coordinates
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`)
          .then(r=>r.json()).then(show).catch(()=> show(null));
      }, {timeout:8000});
    } else {
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=25.4358&longitude=81.8463&current_weather=true`)
        .then(r=>r.json()).then(show).catch(()=> show(null));
    }
    setInterval(()=>{ /* refresh every 10 min */ }, 10*60*1000);
  })();

  // accordions
  document.querySelectorAll('.accordion button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const panel = btn.nextElementSibling;
      if(!panel) return;
      panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
    });
  });

  // gallery populate (if #gallery-grid exists, attempt to load images 1..24)
  (function populateGallery(){
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;
    for(let i=1;i<=24;i++){
      const path = `images/${i}.jpg`;
      const img = new Image();
      img.src = path;
      img.onload = ()=> {
        const el = document.createElement('img');
        el.src = path;
        el.alt = `Photo ${i}`;
        el.addEventListener('click', ()=> openLightbox(path, `Photo ${i}`));
        grid.appendChild(el);
      }
    }
  })();

});

/* ---------- lightbox ---------- */
(function(){
  const lb = document.createElement('div'); lb.className='lightbox';
  lb.innerHTML = '<img id="lb-img" src="" alt=""/>';
  document.body.appendChild(lb);
  lb.addEventListener('click', ()=> lb.classList.remove('open'));
  window.openLightbox = (src, caption)=>{
    document.getElementById('lb-img').src = src;
    lb.classList.add('open');
  };
})();
