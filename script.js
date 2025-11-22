/* ---------------------------------------------------
   CONFIG
---------------------------------------------------- */
const IIIT_COORDS = { lat: 25.4878, lon: 81.8489 };
const GALLERY_KEY = "subrata_gallery_v3";
const JOBS_KEY = "subrata_jobs_v3";
const VIEW_KEY = "subrata_view_count_v4";

/* ---------------------------------------------------
   LOADING SCREEN
---------------------------------------------------- */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("loading-screen").style.display = "none";
    }, 600);
  }, 1500);
});

/* ---------------------------------------------------
   CLOCK
---------------------------------------------------- */
function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerText = now.toLocaleTimeString();
  document.getElementById("date").innerText = now.toLocaleDateString();
}
setInterval(updateClock, 1000);
updateClock();

/* ---------------------------------------------------
   VIEW COUNTER
---------------------------------------------------- */
function incrementView() {
  let v = parseInt(localStorage.getItem(VIEW_KEY) || "0", 10);
  v++;
  localStorage.setItem(VIEW_KEY, String(v));
  document.getElementById("view-count-footer").innerText = v;
}
incrementView();

/* ---------------------------------------------------
   WEATHER (OPEN-METEO)
---------------------------------------------------- */
async function showWeather(lat, lon) {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const r = await fetch(url);
    const data = await r.json();
    if (data && data.current_weather) {
      const t = data.current_weather.temperature;
      document.getElementById("temperature").innerText = `${t}°C`;
      document.getElementById("mini-weather").innerText =
        `Current: ${t}°C • Wind ${data.current_weather.windspeed} km/h`;
    }
  } catch {
    document.getElementById("mini-weather").innerText = "Weather unavailable";
  }
}

function initWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => showWeather(pos.coords.latitude, pos.coords.longitude),
      () => showWeather(IIIT_COORDS.lat, IIIT_COORDS.lon)
    );
  } else {
    showWeather(IIIT_COORDS.lat, IIIT_COORDS.lon);
  }
}
initWeather();

/* ---------------------------------------------------
   MAP (LEAFLET)
---------------------------------------------------- */
const map = L.map("map").setView([IIIT_COORDS.lat, IIIT_COORDS.lon], 11);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

const marker = L.marker([IIIT_COORDS.lat, IIIT_COORDS.lon]).addTo(map);
marker.bindPopup("<b>Indian Institute of Information Technology Allahabad</b>");
marker.bindTooltip("IIIT Allahabad", { direction: "top" });

/* ---------------------------------------------------
   GALLERY
---------------------------------------------------- */
function loadGallery() {
  return JSON.parse(localStorage.getItem(GALLERY_KEY) || "[]");
}

function saveGallery(list) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(list));
}

function renderGallery() {
  const y = document.getElementById("year-select").value;
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";
  const items = loadGallery().filter(x => x.year === y);
  if (!items.length) {
    grid.innerHTML = `<div class='small'>No images for ${y}.</div>`;
    return;
  }
  items.forEach((it, i) => {
    grid.innerHTML += `
      <div class="gallery-item">
        <img src="${it.data}" onclick="openModal('${it.data}')">
      </div>`;
  });
}

function addGalleryImage() {
  const f = document.getElementById("image-file").files[0];
  const y = document.getElementById("year-select").value;
  if (!f) return alert("Select an image.");

  const fr = new FileReader();
  fr.onload = e => {
    const arr = loadGallery();
    arr.unshift({ year: y, data: e.target.result });
    saveGallery(arr);
    renderGallery();
  };
  fr.readAsDataURL(f);
}

function clearGallery() {
  if (confirm("Clear gallery?")) {
    localStorage.removeItem(GALLERY_KEY);
    renderGallery();
  }
}

/* ---------------------------------------------------
   GALLERY MODAL
---------------------------------------------------- */
function openModal(src) {
  document.getElementById("modal-img").src = src;
  document.getElementById("modal").style.display = "flex";
}
function closeModal(e) {
  if (e.target.id === "modal" || e.target.id === "modal-content") {
    document.getElementById("modal").style.display = "none";
  }
}

/* ---------------------------------------------------
   JOBS
---------------------------------------------------- */
function seedJobs() {
  if (!localStorage.getItem(JOBS_KEY)) {
    const seed = [
      {
        id: Date.now() + 1,
        title: "Research Intern - AI",
        company: "IIIT Allahabad",
        country: "India",
        type: "Intern",
        location: "Prayagraj",
        date: new Date().toISOString()
      }
    ];
    localStorage.setItem(JOBS_KEY, JSON.stringify(seed));
  }
}
function loadJobs() {
  seedJobs();
  return JSON.parse(localStorage.getItem(JOBS_KEY) || "[]")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}
function saveJobs(j) {
  localStorage.setItem(JOBS_KEY, JSON.stringify(j));
}

let activeTab = "India";

function setTab(t) {
  activeTab = t;
  renderJobs();
}
function escapeHtml(s) {
  return s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function renderJobs() {
  const list = document.getElementById("job-list");
  const all = loadJobs();
  const search = (document.getElementById("search-key").value || "").toLowerCase();

  let arr = all.filter(j => j.country === activeTab);
  if (search) {
    arr = arr.filter(j =>
      (j.title + j.company + j.location).toLowerCase().includes(search)
    );
  }

  if (!arr.length) {
    list.innerHTML = "<div class='small'>No jobs.</div>";
    return;
  }

  list.innerHTML = "";
  arr.forEach(j => {
    list.innerHTML += `
      <div class="job-card">
        <div style="display:flex;justify-content:space-between;">
          <div>
            <div style="font-weight:700">${escapeHtml(j.title)}</div>
            <div class="small">${escapeHtml(j.company)} • ${escapeHtml(j.location)} • ${new Date(j.date).toLocaleDateString()}</div>
            <div><span class="pill">${escapeHtml(j.type)}</span></div>
          </div>
          <button onclick="removeJob(${j.id})">Remove</button>
        </div>
      </div>`;
  });
}

function addJob() {
  const title = document.getElementById("new-title").value.trim();
  const comp = document.getElementById("new-company").value.trim();
  const loc = document.getElementById("new-location").value.trim();
  const type = document.getElementById("new-type").value;
  const country = document.getElementById("new-country").value;

  if (!title || !comp) return alert("Enter title and company");

  const arr = loadJobs();
  arr.unshift({
    id: Date.now(),
    title,
    company: comp,
    location: loc,
    country,
    type,
    date: new Date().toISOString()
  });

  saveJobs(arr);
  renderJobs();
}
function removeJob(id) {
  if (!confirm("Remove job?")) return;
  saveJobs(loadJobs().filter(j => j.id !== id));
  renderJobs();
}
function clearJobs() {
  if (!confirm("Clear ALL jobs?")) return;
  localStorage.removeItem(JOBS_KEY);
  seedJobs();
  renderJobs();
}

/* ---------------------------------------------------
   CONTACT FORM
---------------------------------------------------- */
function contactFormSubmit(e) {
  e.preventDefault();
  alert("Message saved locally (demo).");
  document.getElementById("c_name").value = "";
  document.getElementById("c_email").value = "";
  document.getElementById("c_msg").value = "";
}

/* ---------------------------------------------------
   SMOOTH SCROLL + ACTIVE MENU
---------------------------------------------------- */
function enableScroll() {
  const header = document.getElementById("site-header");
  const navLinks = document.querySelectorAll("nav.global a");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (href.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(href);
        const y = el.getBoundingClientRect().top + window.scrollY - 110;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");
  window.addEventListener("scroll", () => {
    let current = null;
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(a => a.classList.remove("active"));
    if (current) {
      const link = document.querySelector(`nav.global a[href="#${current}"]`);
      if (link) link.classList.add("active");
    }
  });
}
enableScroll();

/* ---------------------------------------------------
   THEME SWITCHER
---------------------------------------------------- */
const themeBtn = document.getElementById("theme-toggle");

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
  themeBtn.textContent = document.body.classList.contains("dark-theme")
    ? "☀️"
    : "🌙";
});

/* ---------------------------------------------------
   LANGUAGE TRANSLATION ENGINE
---------------------------------------------------- */
const translations = {
  en: { "home.title": "Welcome to My Webpage", "nav.home": "Home", "nav.about": "About" },
  hi: { "home.title": "मेरे वेबपेज पर आपका स्वागत है", "nav.home": "होम", "nav.about": "परिचय" },
  bn: { "home.title": "আমার ওয়েবপেজে স্বাগতম", "nav.home": "হোম", "nav.about": "আমার সম্পর্কে" },
  ta: { "home.title": "என் வலைப்பக்கத்திற்கு வரவேற்கிறேன்", "nav.home": "முகப்பு", "nav.about": "என்னை பற்றி" },
  te: { "home.title": "నా వెబ్‌పేజ్‌కి స్వాగతం", "nav.home": "హోమ్", "nav.about": "గురించి" },
  mr: { "home.title": "माझ्या वेबपेजवर स्वागत आहे", "nav.home": "मुख्यपृष्ठ", "nav.about": "माझ्याबद्दल" },
  gu: { "home.title": "મારા વેબપેજ પર આપનું સ્વાગત છે", "nav.home": "હોમ", "nav.about": "વિશે" },
  kn: { "home.title": "ನನ್ನ ವೆಬ್‌ಪೇಜ್‌ಗೆ ಸ್ವಾಗತ", "nav.home": "ಮುಖ್ಯ ಪುಟ", "nav.about": "ಬಗ್ಗೆ" },
  ml: { "home.title": "എന്റെ വെബ്‌പേജിലേക്ക് സ്വാഗതം", "nav.home": "ഹോം", "nav.about": "എന്നെക്കുറിച്ച്" },
  or: { "home.title": "ମୋ ୱେବ୍‌ପେଜ୍‌କୁ ସ୍ଵାଗତ", "nav.home": "ହୋମ୍", "nav.about": "ପରିଚୟ" },
  pa: { "home.title": "ਮੇਰੇ ਵੈੱਬਪੇਜ ’ਚ ਸੁਆਗਤ ਹੈ", "nav.home": "ਹੋਮ", "nav.about": "ਬਾਰੇ" },
  ur: { "home.title": "میرے ویب پیج میں خوش آمدید", "nav.home": "ہوم", "nav.about": "متعلق" }
};

document.getElementById("language-switcher").addEventListener("change", function () {
  const lang = this.value;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) el.innerHTML = translations[lang][key];
  });
});

/* ---------------------------------------------------
   CHATBOT
---------------------------------------------------- */
const chatbotBubble = document.getElementById("chatbot-bubble");
const chatbotBox = document.getElementById("chatbot-box");
const chatbotSend = document.getElementById("chatbot-send");
const chatbotInput = document.getElementById("chatbot-input");
const msgArea = document.getElementById("chatbot-messages");

chatbotBubble.addEventListener("click", () => {
  chatbotBox.style.display =
    chatbotBox.style.display === "block" ? "none" : "block";
});

chatbotSend.addEventListener("click", sendMessage);
chatbotInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = chatbotInput.value.trim();
  if (!text) return;
  addUser(text);
  chatbotInput.value = "";

  setTimeout(() => {
    addBot("I received your message: " + text);
  }, 400);
}

function addUser(msg) {
  msgArea.innerHTML += `<div class="chatbot-msg user">${msg}</div>`;
  msgArea.scrollTop = msgArea.scrollHeight;
}
function addBot(msg) {
  msgArea.innerHTML += `<div class="chatbot-msg bot">${msg}</div>`;
  msgArea.scrollTop = msgArea.scrollHeight;
}

/* ---------------------------------------------------
   INITIALIZE GALLERY + JOBS
---------------------------------------------------- */
renderGallery();
renderJobs();
