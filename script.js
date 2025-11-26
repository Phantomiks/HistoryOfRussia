// app.js — frontend WebApp logic
// Works with API endpoints: GET /api/user?tg_id=...  POST /api/action

const API_ROOT = location.origin; // if running with Flask on same host
// For direct static demo without server, the app falls back to localStorage

// current user (will be loaded)
let currentUser = null;

// demo achievements catalog (server will mirror similar objects)
const ACH_CATALOG = [
  { id: "first_launch", title: "Первый вход", desc: "Открыл личный кабинет", condition: (u)=> u.meta.views >= 1 },
  { id: "streak_3", title: "Три дня подряд", desc: "Поддержи 3-дневный стрик", condition: (u)=> u.streak >= 3 },
  { id: "streak_7", title: "Неделя", desc: "7 дней подряд", condition: (u)=> u.streak >= 7 },
  { id: "invite_1", title: "Приглашён друг", desc: "Пригласи первого друга", condition: (u)=> u.ref.invited >= 1 },
  { id: "collector", title: "Коллекционер", desc: "Набери 10 лайков на карточки", condition: (u)=> u.meta.totalLikes >= 10 }
];

// DOM refs
const userNameEl = document.getElementById("userName");
const streakValueEl = document.getElementById("streakValue");
const lastActiveEl = document.getElementById("lastActive");
const streakBarEl = document.getElementById("streakBar");
const claimBtn = document.getElementById("claimDaily");
const achListEl = document.getElementById("achievementsList");
const refCodeEl = document.getElementById("refCode");
const refCountEl = document.getElementById("refCount");
const shareRefBtn = document.getElementById("shareRef");
const copyRefBtn = document.getElementById("copyRef");

// Helpers for local fallback
function localKey(tgId){ return "lk_user_"+tgId; }
function saveLocal(tgId, data){ localStorage.setItem(localKey(tgId), JSON.stringify(data)); }
function loadLocal(tgId){ const s = localStorage.getItem(localKey(tgId)); return s ? JSON.parse(s) : null; }

// build UI
function renderUI(user){
  currentUser = user;
  userNameEl.textContent = user.name || "Пользователь";
  streakValueEl.textContent = user.streak || 0;
  lastActiveEl.textContent = user.last_active || "—";
  // progress toward next 7-day streak (simple)
  const pct = Math.min(100, Math.round((user.streak % 7) / 7 * 100));
  streakBarEl.style.width = pct + "%";

  // achievements
  achListEl.innerHTML = "";
  ACH_CATALOG.forEach(a=>{
    const unlocked = user.ach && user.ach[a.id];
    const el = document.createElement("div");
    el.className = "ach-item" + (unlocked ? "" : " locked");
    el.innerHTML = `<div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div>`;
    achListEl.appendChild(el);
  });

  // referral
  refCodeEl.textContent = user.ref.code || "—";
  refCountEl.textContent = user.ref.invited || 0;
}

// API: get user, fallback to local
async function fetchUser(tgId) {
  try {
    const res = await fetch(`${API_ROOT}/api/user?tg_id=${encodeURIComponent(tgId)}`);
    if (!res.ok) throw new Error("api error");
    const json = await res.json();
    return json;
  } catch (err) {
    // fallback local
    const local = loadLocal(tgId);
    if (local) return local;
    // create local demo user
    const demo = {
      tg_id: tgId,
      name: "Гость",
      streak: 0,
      last_active: null,
      ach: {},
      ref: { code: `ref_${tgId}`, invited: 0 },
      meta: { views: 0, totalLikes: 0 }
    };
    saveLocal(tgId, demo);
    return demo;
  }
}

// API: post action
async function postAction(tgId, action, payload = {}) {
  try {
    const res = await fetch(`${API_ROOT}/api/action`, {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ tg_id: tgId, action, payload })
    });
    if (!res.ok) throw new Error("post fail");
    return await res.json();
  } catch (err) {
    // local fallback (mutate localStorage)
    const local = loadLocal(tgId) || { tg_id: tgId, name:"Гость", streak:0,last_active:null,ach:{},ref:{code:`ref_${tgId}`,invited:0},meta:{views:0,totalLikes:0} };
    if (action === "claim_daily") {
      const today = new Date().toISOString().slice(0,10);
      if (local.last_active === today) {
        return local;
      }
      // increment streak logic: if yesterday was last_active -> +1 else reset to 1
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
      if (local.last_active === yesterday) local.streak = (local.streak || 0) + 1;
      else local.streak = 1;
      local.last_active = today;
      // award achievements automatically
      ACH_CATALOG.forEach(a => {
        if (a.condition(local)) local.ach[a.id] = true;
      });
      saveLocal(tgId, local);
    } else if (action === "increment_ref") {
      local.ref.invited = (local.ref.invited || 0) + 1;
      ACH_CATALOG.forEach(a => { if (a.condition(local)) local.ach[a.id] = true; });
      saveLocal(tgId, local);
    }
    return local;
  }
}

// pick Telegram user id if available from WebApp, otherwise generate a demo id
function detectUserId() {
  // try Telegram WebApp data
  try {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id) {
      return String(tg.initDataUnsafe.user.id);
    }
  } catch (e){}
  // fallback: deterministic demo id stored in localStorage
  if (!localStorage.getItem("demo_tg")) {
    localStorage.setItem("demo_tg", String(Math.floor(100000 + Math.random()*899999)));
  }
  return localStorage.getItem("demo_tg");
}

// handlers
async function init() {
  const tgId = detectUserId();
  const user = await fetchUser(tgId);
  renderUI(user);

  claimBtn.onclick = async () => {
    claimBtn.disabled = true;
    claimBtn.textContent = "Сохраняю…";
    const res = await postAction(tgId, "claim_daily");
    renderUI(res);
    claimBtn.textContent = "Отметить сегодня";
    claimBtn.disabled = false;
  };

  shareRefBtn.onclick = async () => {
    const link = `${location.origin}/?ref=${encodeURIComponent(currentUser.ref.code)}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Присоединяйся к Историям", text: "Классная лента", url: link }); }
      catch(e) { alert("Ошибка шаринга"); }
    } else {
      prompt("Отправь эту ссылку друзьям:", link);
    }
  };

  copyRefBtn.onclick = () => {
    const link = `${location.origin}/?ref=${encodeURIComponent(currentUser.ref.code)}`;
    navigator.clipboard?.writeText(link).then(()=> {
      copyRefBtn.textContent = "Скопировано!";
      setTimeout(()=> copyRefBtn.textContent = "Копировать ссылку", 1200);
    });
  };
}

// start
init();
