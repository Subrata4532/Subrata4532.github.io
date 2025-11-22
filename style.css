:root{
  --saffron: #FF9933;
  --white: #ffffff;
  --green: #138808;
  --accent1: #2b5fa8;
  --accent2: #213e63;
  --bg-center: #fbfbff;
  --card: rgba(255,255,255,0.98);
  --muted:#596472;
  --max-width:1200px;
  --text:#111;
  --flower-url: url("images/flower_hd.png");
}

/* full-page tricolor gradient background (Option 1) with flower overlay */
html,body{ height:100%; margin:0; font-family: "Georgia", serif; color:var(--text); background: linear-gradient(180deg, var(--saffron) 0%, var(--white) 40%, var(--green) 100%); }
body{
  background-image: var(--flower-url);
  background-repeat: no-repeat;
  background-position: left top, right bottom;
  background-size: 360px 360px, 360px 360px;
  background-attachment: fixed;
  transition: background-color .25s ease, color .25s ease;
}

/* tricolor ribbon */
.tricolor-ribbon{ position:fixed; top:0; left:0; right:0; height:6px; z-index:2000; display:flex; box-shadow:0 1px 6px rgba(0,0,0,0.06); }
.tricolor-ribbon .saffron{ flex:1; background:var(--saffron); }
.tricolor-ribbon .white{ flex:1; background:var(--white); }
.tricolor-ribbon .green{ flex:1; background:var(--green); }

/* loading */
#loading-screen{ position:fixed; inset:0; display:flex; align-items:center; justify-content:center; flex-direction:column; background:rgba(255,255,255,0.92); z-index:9999; transition:opacity .5s ease; }
.welcome-text{ font-size:22px; font-weight:700; margin-bottom:10px; color:var(--accent2); }
.loader{ width:72px; height:8px; background:linear-gradient(90deg,var(--saffron),var(--green)); border-radius:6px; animation:loader 1.4s infinite; margin-bottom:8px; }
@keyframes loader{ 0%{ transform:scaleX(.3) }50%{ transform:scaleX(1)}100%{ transform:scaleX(.3)}}
.loading-text{ font-size:13px; color:var(--muted); }

/* top info (time/date/day) */
#top-info{ position:fixed; left:12px; top:14px; z-index:1500; background:rgba(255,255,255,0.92); padding:6px 10px; border-radius:8px; box-shadow:0 6px 16px rgba(0,0,0,0.06); font-size:13px; color:var(--accent2); }

/* layout wrapper */
.wrap{ max-width:var(--max-width); margin:0 auto; padding:0 20px; position:relative; }
.topbar{ padding:18px 0 50px; position:sticky; top:6px; z-index:120; background: linear-gradient(90deg, rgba(255,153,51,0.95), rgba(255,255,255,0.0)); box-shadow:0 10px 22px rgba(0,0,0,0.08); }
.title{ text-align:center; font-size:26px; font-weight:700; color:#06203a; text-shadow: 0 1px 0 rgba(255,255,255,0.6); }
.header-controls{ position:absolute; right:10px; top:8px; display:flex; gap:8px; align-items:center; }

/* header controls */
.header-controls select{ padding:6px; border-radius:6px; border:1px solid rgba(0,0,0,0.08); background:rgba(255,255,255,0.96); }
#theme-toggle{ padding:6px 8px; border-radius:6px; border:none; cursor:pointer; background:var(--white); }
.cv-btn{ background: linear-gradient(90deg,var(--saffron),var(--green)); color:#fff; border:none; padding:6px 10px; border-radius:6px; }

/* nav */
nav.global{ display:flex; justify-content:center; gap:10px; padding:10px 8px; background: linear-gradient(90deg, rgba(255,153,51,0.95), rgba(255,255,255,0.02)); flex-wrap:wrap; position:relative; z-index:100; border-radius:8px; margin:10px auto 0; max-width:calc(var(--max-width) - 40px); }
nav.global a{ color:#06203a; text-decoration:none; padding:8px 12px; border-radius:8px; font-weight:700; background:rgba(255,255,255,0.6); box-shadow:0 2px 6px rgba(0,0,0,0.06); transition: all .18s; }
nav.global a:hover{ transform: translateY(-3px); background: linear-gradient(90deg, rgba(255,153,51,0.12), rgba(19,136,8,0.06)); }
nav.global a.active{ box-shadow: inset 0 -3px 0 rgba(0,0,0,0.08); }

/* main grid */
.container{ max-width:var(--max-width); margin:34px auto; padding:0 20px; display:grid; grid-template-columns:300px 1fr 340px; gap:28px; align-items:start; }
@media (max-width:1100px){ .container{ grid-template-columns:1fr; padding:0 14px; } #top-info{ display:none; } }

/* cards */
.section-card{ background:var(--card); border-radius:12px; padding:18px; margin-bottom:20px; box-shadow:0 10px 30px rgba(0,0,0,0.06); border-left:6px solid rgba(0,0,0,0.04); transition:all .35s ease; }
.section-card h2{ margin-top:0; color:#06203a; font-size:18px; border-bottom:1px dashed rgba(0,0,0,0.06); padding-bottom:8px; }
.section-card h2::after{ content:""; display:block; height:6px; margin-top:8px; border-radius:4px; background: linear-gradient(90deg, var(--saffron), var(--white), var(--green)); opacity:0.9; width:120px; }

/* profile styles */
.profile .img{ width:100%; height:280px; display:flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#fff,#f3f1f5); border-radius:12px; overflow:hidden; }
.profile img{ width:220px; height:220px; object-fit:cover; border-radius:50%; box-shadow:0 10px 28px rgba(0,0,0,0.15); border:6px solid rgba(255,255,255,0.92); }
.profile h3{ text-align:center; margin:12px 0 6px; font-size:18px; }
.meta{ text-align:center; font-size:13px; color:var(--muted); }

/* info blocks */
.info-block{ margin-top:12px; text-align:center; }
.big{ font-weight:700; font-size:18px; }

/* gallery */
.gallery-controls{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.gallery-grid{ display:grid; grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); gap:10px; margin-top:12px; }
.gallery-item{ border-radius:8px; overflow:hidden; background:#f8f8f8; cursor:pointer; border:1px solid rgba(0,0,0,0.04); }
.gallery-item img{ width:100%; height:140px; object-fit:cover; display:block; transition: transform .25s ease; }
.gallery-item img:hover{ transform:scale(1.04); }

/* jobs */
.job-card{ background:#fff; padding:10px 12px; border-radius:10px; margin:10px 0; border-left:8px solid var(--saffron); box-shadow:0 6px 12px rgba(0,0,0,0.04); }
.pill{ display:inline-block; padding:4px 8px; border-radius:999px; background:linear-gradient(90deg,var(--saffron),var(--green)); color:#fff; }

/* map */
#map{ width:100%; height:320px; border-radius:10px; border:1px solid rgba(0,0,0,0.06); }

/* chatbot */
#chatbot-bubble{ position:fixed; bottom:24px; right:24px; background:linear-gradient(90deg,var(--saffron),var(--green)); color:#fff; padding:12px; border-radius:50%; cursor:pointer; z-index:900; box-shadow:0 8px 20px rgba(0,0,0,0.2); }
#chatbot-box{ position:fixed; bottom:90px; right:24px; width:320px; background:var(--card); border-radius:12px; display:none; flex-direction:column; box-shadow:0 10px 30px rgba(0,0,0,0.12); z-index:901; }
#chatbot-header{ background: linear-gradient(90deg,var(--saffron),var(--green)); color:white; padding:10px; border-radius:12px 12px 0 0; font-weight:700; }
#chatbot-messages{ height:260px; overflow:auto; padding:10px; }
.chatbot-msg{ margin-bottom:8px; padding:8px; border-radius:8px; }
.chatbot-msg.bot{ background:rgba(19,136,8,0.06); }
.chatbot-msg.user{ background:rgba(255,153,51,0.06); text-align:right; }

/* footer */
footer{ margin-top:30px; padding:16px 0; text-align:center; }
.footer-line{ max-width:var(--max-width); margin:0 auto; padding:10px; display:flex; justify-content:center; }
.footer-inner{ background: rgba(255,255,255,0.9); padding:10px 18px; border-radius:10px; color:#213048; display:flex; gap:12px; align-items:center; }

/* modal */
.modal{ position:fixed; inset:0; display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.6); z-index:2000; }
.modal .content{ max-width:900px; width:92%; background:white; padding:12px; border-radius:10px; }
.modal img{ width:100%; height:auto; display:block; border-radius:6px; }

/* marquee */
.marquee{ margin-top:12px; padding:8px 10px; border-radius:8px; background:linear-gradient(90deg, rgba(255,153,51,0.06), rgba(19,136,8,0.02)); overflow:hidden; white-space:nowrap; }
.marquee span{ display:inline-block; padding-left:100%; animation:scroll-left 18s linear infinite; }
@keyframes scroll-left{ 0%{ transform:translateX(0) } 100%{ transform:translateX(-100%) } }

/* dark mode */
body.dark-mode{
  background: linear-gradient(180deg, #0a0f16 0%, #0a0f16 100%);
  color: #eaf2ff;
}
body.dark-mode .section-card{ background: rgba(8,12,20,0.86); border-left-color: rgba(255,255,255,0.04); box-shadow:0 8px 22px rgba(0,0,0,0.6); }
body.dark-mode .footer-inner{ background: rgba(8,12,20,0.6); color:#eaf2ff; }
body.dark-mode #top-info{ background: rgba(7,14,25,0.7); color:#f1f7ff; }

/* responsive */
@media (max-width:900px){
  .container{ grid-template-columns: 1fr; }
  .header-controls{ position:static; margin-top:8px; justify-content:flex-end; }
  nav.global{ padding:8px; max-width:100%; border-radius:8px; }
  .tricolor-ribbon{ display:none; }
}
