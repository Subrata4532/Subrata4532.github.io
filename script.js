/* ============================= */
/* LOADING SCREEN                */
/* ============================= */
window.onload = function () {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
  }, 1500);
};

/* ============================= */
/* THEME SWITCHER                */
/* ============================= */
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
};

/* ============================= */
/* CHATBOT                       */
/* ============================= */
const box = document.getElementById("chatbot-box");
const bubble = document.getElementById("chatbot-bubble");
const msgArea = document.getElementById("chatbot-messages");
const input = document.getElementById("chatbot-input");

bubble.onclick = () => {
  box.style.display = box.style.display === "flex" ? "none" : "flex";
};

document.getElementById("chatbot-send").onclick = sendMsg;

function sendMsg() {
  let text = input.value.trim();
  if (!text) return;

  msgArea.innerHTML += `<div class="chatbot-msg user">${text}</div>`;
  input.value = "";

  setTimeout(() => {
    msgArea.innerHTML += `<div class="chatbot-msg bot">Thanks! I received: ${text}</div>`;
    msgArea.scrollTop = msgArea.scrollHeight;
  }, 600);
}

/* ============================= */
/* SMOOTH NAVIGATION             */
/* ============================= */
document.querySelectorAll("nav.global a").forEach(a => {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    let id = this.getAttribute("href");
    let section = document.querySelector(id);
    window.scrollTo({ top: section.offsetTop - 120, behavior: "smooth" });
  });
});

/* ============================= */
/* LANGUAGE SWITCHER (ALL STATES)*/
/* ============================= */
const translations = {
  hi: { "nav.home": "होम", "home.title": "स्वागत" },
  bn: { "nav.home": "হোম", "home.title": "স্বাগতম" },
  ta: { "nav.home": "முகப்பு", "home.title": "வரவேற்பு" },
  te: { "nav.home": "హోమ్", "home.title": "స్వాగతం" },
  kn: { "nav.home": "ಮುಖಪುಟ", "home.title": "ಸ್ವಾಗತ" },
  ml: { "nav.home": "ഹോം", "home.title": "സ്വാഗതം" },
  mr: { "nav.home": "मुख्यपृष्ठ", "home.title": "स्वागत" },
  gu: { "nav.home": "મુખ્ય પૃષ્ઠ", "home.title": "સ્વાગત છે" },
  pa: { "nav.home": "ਹੋਮ", "home.title": "ਸਵਾਗਤ ਹੈ" },
  or: { "nav.home": "ମୂଳ ପୃଷ୍ଠା", "home.title": "ସ୍ବାଗତ" },
  ur: { "nav.home": "ہوم", "home.title": "خوش آمدید" }
};

document.getElementById("language-switcher").onchange = function () {
  let lang = this.value;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    let key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });
};

/* ============================= */
/* MAP                          */
/* ============================= */
let map = L.map('map').setView([25.4303, 81.7703], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.marker([25.4303, 81.7703]).addTo(map).bindPopup("IIIT Allahabad");
