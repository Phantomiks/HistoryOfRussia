/* app.js — крупный, качественный, автономный frontend
   - одна карточка по центру
   - свайп вверх/вниз для листания
   - свайп влево/вправо для переключения вкладок
   - кнопки под карточкой: лайк и закладка
   - рекомендации генерируются фронтово на основе лайков и просмотров
   - поддержка тач/мышь (pointer events)
*/

(() => {
  // ---------------------------
  // Исходные данные (контент)
  // ---------------------------
  const normalFeed = [
    { id: "f1", title: "1380 — Куликовская битва", text: "Дмитрий Донской одержал победу над Мамаем, что стало поворотным моментом в ослаблении ордынского влияния." , tags: ["война","сражение","донской"]},
    { id: "f2", title: "1703 — Основание Санкт-Петербурга", text: "Пётр I основал город на берегах Невы, который стал окном в Европу и новой столицей государства.", tags: ["город","петр","петербург"]},
    { id: "f3", title: "1945 — Победа в Великой Отечественной войне", text: "9 мая — окончание войны в Европе: капитуляция нацистской Германии и завершение кровопролития.", tags: ["вов","победа","память"]},
    { id: "f4", title: "1961 — Первый полёт в космос", text: "Юрий Гагарин стал первым человеком, побывавшим в космосе, совершив орбитальный полёт на «Востоке-1».", tags:["космос","гагарин","наука"]},
    { id: "f5", title: "1917 — Октябрьская революция", text: "Революционные события 1917 года, приведшие к смене власти и радикальным политическим изменениям.", tags:["революция","1917","политика"]},
    { id: "f6", title: "1861 — Отмена крепостного права", text: "Александр II подписал указ об отмене крепостного права, начав серьёзные социальные реформы.", tags:["реформа","александр2","общество"]}
  ];

  // We'll keep counters and metadata in memory (could be persisted via localStorage)
  const meta = {}; // id -> {views, likes, saved}
  normalFeed.forEach(item => { meta[item.id] = { views: 0, likes: 0, saved: 0 }; });

  // Recommended feed (generated)
  let recommendedFeed = [];

  // State
  let currentTab = "following"; // "following" or "for-you"
  let feed = normalFeed.slice();
  let idx = 0;

  // Elements
  const viewport = document.getElementById("viewport");
  const tabs = document.querySelectorAll(".tab");

  // Utility - clamp index
  const clampIndex = (i, arr) => {
    if (arr.length === 0) return 0;
    if (i < 0) return arr.length - 1;
    if (i >= arr.length) return 0;
    return i;
  };

  // Create visible card element
  function makeCard(item) {
    const el = document.createElement("div");
    el.className = "card";

    el.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-sub">Дата / История</div>
      </div>
      <div class="card-body">${escapeHtml(item.text)}</div>

      <div class="actions-row">
        <button class="action like-btn">❤ <span class="counter" data-role="likes">${meta[item.id].likes}</span></button>
        <button class="action save-btn ghost">★ <span class="counter" data-role="saved">${meta[item.id].saved}</span></button>
      </div>
    `;
    return el;
  }

  // Escape helper
  function escapeHtml(s){ const d=document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // Load feed for given tab (set feed variable & reset idx)
  function loadFeed(tab) {
    currentTab = tab;
    // set feed array
    if (tab === "following") {
      feed = normalFeed.slice();
    } else {
      // ensure recommended generated
      if (recommendedFeed.length === 0) generateRecommended();
      feed = recommendedFeed.slice();
    }
    idx = 0;
    renderCurrent();
    updateTabsUI();
  }

  // Render the current card to viewport (single-card model)
  function renderCurrent() {
    viewport.innerHTML = "";
    if (!feed || feed.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card visible";
      empty.innerHTML = `<div class="card-body">Нет карточек в разделе</div>`;
      viewport.appendChild(empty);
      return;
    }

    const item = feed[clampIndex(idx,feed)];
    const card = makeCard(item);
    viewport.appendChild(card);

    // ensure visibility with slight enter animation
    requestAnimationFrame(() => {
      card.classList.add("visible");
    });

    // register meta: view count
    meta[item.id].views += 1;
    // attach handlers
    attachCardHandlers(card, item);
  }

  // Attach action handlers (like/save) and animate
  function attachCardHandlers(card, item) {
    const likeBtn = card.querySelector(".like-btn");
    const saveBtn = card.querySelector(".save-btn");
    const likesCounter = card.querySelector('[data-role="likes"]');
    const savedCounter = card.querySelector('[data-role="saved"]');

    likeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      meta[item.id].likes += 1;
      likesCounter.textContent = meta[item.id].likes;
      animatePulse(likeBtn);
      // regenerate recommendations more intelligently
      generateRecommended();
    });

    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      meta[item.id].saved = meta[item.id].saved ? 0 : 1;
      savedCounter.textContent = meta[item.id].saved;
      saveBtn.classList.toggle("active", meta[item.id].saved === 1);
      animatePulse(saveBtn);
    });
  }

  // Simple pulse animation
  function animatePulse(el) {
    el.style.transform = "scale(1.12)";
    el.style.transition = "transform 0.12s ease";
    setTimeout(() => { el.style.transform = ""; }, 120);
  }

  // Generate recommended feed (front-end heuristic)
  function generateRecommended() {
    // algorithm:
    // 1. take all items, score = views*0.3 + likes*1.2 + (saved?2:0)
    // 2. boost items that share tags with liked items
    const scores = new Map();
    normalFeed.forEach(item => {
      const m = meta[item.id];
      const base = (m.views || 0) * 0.25 + (m.likes || 0) * 1.2 + (m.saved ? 2.0 : 0);
      scores.set(item.id, base);
    });

    // tag boosting: collect tags from liked items
    const likedTags = new Set();
    normalFeed.forEach(item => {
      if (meta[item.id].likes > 0) {
        (item.tags || []).forEach(t => likedTags.add(t));
      }
    });

    // apply tag boost
    normalFeed.forEach(item => {
      let boost = 0;
      (item.tags || []).forEach(t => { if (likedTags.has(t)) boost += 0.8; });
      scores.set(item.id, (scores.get(item.id) || 0) + boost);
    });

    // sort by score desc and make recommendedFeed
    recommendedFeed = normalFeed
      .map(it => ({ it, score: scores.get(it.id) || 0 }))
      .sort((a,b) => b.score - a.score)
      .map(x => x.it);

    // if empty fallback to normal
    if (recommendedFeed.length === 0) recommendedFeed = normalFeed.slice();
  }

  // Swipe implementation — pointer-based, unified for mouse & touch
  let pointerActive = false;
  let startX = 0, startY = 0;
  let lastTranslateY = 0;
  const SWIPE_THRESHOLD = 80; // px
  const SIDE_THRESHOLD = 80;

  function onPointerDown(e) {
    // ignore multi-touch
    if (e.pointerType === 'touch' && e.isPrimary === false) return;
    pointerActive = true;
    startX = e.clientX;
    startY = e.clientY;
    lastTranslateY = 0;
    // ensure capture
    (e.target || e.srcElement).setPointerCapture && (e.target || e.srcElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!pointerActive) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const card = viewport.querySelector(".card");
    if (!card) return;

    // move card visually by dy (vertical)
    card.style.transition = "none";
    card.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
    // reveal subtle next/prev by scaling
    lastTranslateY = dy;
  }

  function onPointerUp(e) {
    if (!pointerActive) return;
    pointerActive = false;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const card = viewport.querySelector(".card");
    if (!card) return;

    card.style.transition = "";

    // vertical swipe (up/down)
    if (absY > absX && Math.abs(dy) > SWIPE_THRESHOLD) {
      if (dy < 0) {
        // swipe up -> next
        card.classList.add("swipe-up");
        setTimeout(() => {
          idx = clampIndex(idx + 1, feed);
          renderCurrent();
        }, 300);
      } else {
        // swipe down -> prev
        card.classList.add("swipe-down");
        setTimeout(() => {
          idx = clampIndex(idx - 1, feed);
          renderCurrent();
        }, 300);
      }
      return;
    }

    // horizontal swipe switches tabs
    if (absX > absY && Math.abs(dx) > SIDE_THRESHOLD) {
      if (dx < 0) {
        // left -> to "for-you"
        if (currentTab !== "for-you") {
          card.classList.add("swipe-left");
          setTimeout(() => { loadFeed("for-you"); }, 300);
        } else {
          // already in for-you => bounce back
          card.style.transform = "translate(-50%,-50%)";
        }
      } else {
        // right -> to "following"
        if (currentTab !== "following") {
          card.classList.add("swipe-right");
          setTimeout(() => { loadFeed("following"); }, 300);
        } else {
          card.style.transform = "translate(-50%,-50%)";
        }
      }
      return;
    }

    // not enough movement — reset position
    card.style.transform = "translate(-50%,-50%)";
  }

  // helper: clamp index respecting feed length
  function clampIndex(i, arr) {
    if (!arr || arr.length === 0) return 0;
    if (i < 0) return arr.length - 1;
    if (i >= arr.length) return 0;
    return i;
  }

  // update tabs UI
  function updateTabsUI() {
    tabs.forEach(t => {
      t.classList.toggle("active", t.dataset.tab === (currentTab === "for-you" ? "for-you" : "following"));
    });
  }

  // tab click handlers
  function setupTabs() {
    tabs.forEach(t => {
      t.addEventListener("click", () => {
        const tabKey = t.dataset.tab;
        if (tabKey === "for-you") loadFeed("for-you");
        else loadFeed("following");
      });
    });
  }

  // load feed by tab key and render
  function loadFeed(tabKey) {
    currentTab = tabKey;
    if (tabKey === "following") feed = normalFeed.slice();
    else {
      if (recommendedFeed.length === 0) generateRecommended();
      feed = recommendedFeed.slice();
    }
    idx = 0;
    renderCurrent();
    updateTabsUI();
  }

  // initial render
  function renderCurrent() {
    viewport.innerHTML = "";
    if (!feed || feed.length === 0) {
      const empty = document.createElement("div");
      empty.className = "card visible";
      empty.innerHTML = `<div class="card-body">Здесь пока пусто</div>`;
      viewport.appendChild(empty);
      return;
    }

    const item = feed[clampIndex(idx, feed)];
    const card = makeCard(item);
    viewport.appendChild(card);

    // allow CSS transition to animate visibility
    requestAnimationFrame(() => card.classList.add("visible"));
  }

  // attach global pointer listeners to viewport
  function setupPointerHandling() {
    viewport.addEventListener("pointerdown", onPointerDown, {passive:false});
    viewport.addEventListener("pointermove", onPointerMove, {passive:false});
    viewport.addEventListener("pointerup", onPointerUp, {passive:false});
    viewport.addEventListener("pointercancel", onPointerUp, {passive:false});
    // prevent default touch gestures on mobile to keep control
    viewport.addEventListener("touchmove", (e) => { /* allow scroll-blocking if needed */ }, {passive:false});
  }

  // DOM helper to create card element and attach its handlers
  function makeCard(item) {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <div class="card-head">
        <div class="card-title">${escapeHtml(item.title)}</div>
        <div class="card-sub">Историческая заметка</div>
      </div>
      <div class="card-body">${escapeHtml(item.text)}</div>
      <div class="actions-row">
        <button class="action like-btn">❤ <span class="counter">${meta[item.id].likes}</span></button>
        <button class="action save-btn ghost">★ <span class="counter">${meta[item.id].saved}</span></button>
      </div>
    `;

    // like / save
    el.querySelector(".like-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      meta[item.id].likes += 1;
      el.querySelector(".like-btn .counter").textContent = meta[item.id].likes;
      animatePulse(el.querySelector(".like-btn"));
      generateRecommended();
    });

    el.querySelector(".save-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      meta[item.id].saved = meta[item.id].saved ? 0 : 1;
      el.querySelector(".save-btn .counter").textContent = meta[item.id].saved;
      el.querySelector(".save-btn").classList.toggle("active", meta[item.id].saved === 1);
      animatePulse(el.querySelector(".save-btn"));
    });

    return el;
  }

  // small html escape
  function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // boot
  function boot() {
    setupTabs();
    setupPointerHandling();
    generateRecommended();
    loadFeed("following"); // default
  }

  boot();

})();