const STORIES = [
  {date:"26 ноября 2025", desc:"Подписание важного исторического документа, изменившего ход истории.", bg:"#0f1724"},
  {date:"9 мая 1945", desc:"Победа в Великой Отечественной войне. День памяти и славы.", bg:"#1a1f36"},
  {date:"12 апреля 1961", desc:"Первый человек в космосе — Юрий Гагарин.", bg:"#0b1a2b"},
  {date:"12 июня 1990", desc:"Принятие Декларации о государственном суверенитете России.", bg:"#10233c"},
  {date:"7 ноября 1917", desc:"Октябрьская революция в России, начало советской эпохи.", bg:"#1c1c2f"},
  {date:"1 сентября 2023", desc:"Начало нового учебного года в российских школах.", bg:"#111830"}
];

const container = document.getElementById("storyContainer");
let currentIndex = 0;

// Создаём карточки
STORIES.forEach((story, i)=>{
  const card = document.createElement("div");
  card.className = "story-card";
  card.style.zIndex = STORIES.length - i;
  card.style.background = story.bg;
  card.dataset.index = i;
  card.dataset.liked = false;
  card.dataset.bookmarked = false;

  card.innerHTML = `
    <h2 class="story-date">${story.date}</h2>
    <p class="story-desc">${story.desc}</p>
    <div class="story-actions">
      <button class="action-btn like">❤️</button>
      <button class="action-btn bookmark">🔖</button>
    </div>
  `;

  // Лайк и закладка
  card.querySelector(".like").addEventListener("click", ()=>toggleLike(card));
  card.querySelector(".bookmark").addEventListener("click", ()=>toggleBookmark(card));

  container.appendChild(card);
});

// Свайпы
let startY = 0;
let isDragging = false;

function handleTouchStart(e){
  startY = e.touches[0].clientY;
  isDragging = true;
}
function handleTouchMove(e){
  if(!isDragging) return;
  const moveY = e.touches[0].clientY - startY;
  const card = container.children[currentIndex];
  card.style.transform = `translate(-50%, calc(-50% + ${moveY}px))`;
  card.style.opacity = `${1 - Math.abs(moveY)/600}`;
}
function handleTouchEnd(e){
  if(!isDragging) return;
  isDragging = false;
  const endY = e.changedTouches[0].clientY;
  const diff = endY - startY;
  const card = container.children[currentIndex];

  if(diff < -80 && currentIndex < STORIES.length-1){
    swipeNext(card,1);
  } else if(diff > 80 && currentIndex > 0){
    swipeNext(card,-1);
  } else {
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform = "translate(-50%, -50%)";
    card.style.opacity = "1";
  }
}

function swipeNext(card,direction){
  card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
  card.style.transform = `translate(-50%, ${direction>0?-150:150}%)`;
  card.style.opacity = "0";

  currentIndex += direction;
  setTimeout(()=>{
    card.style.transition = "none";
    card.style.transform = "translate(-50%, -50%)";
    card.style.opacity = "1";
  },300);
}

// Лайк/Закладка
function toggleLike(card){
  card.dataset.liked = card.dataset.liked==="true"?"false":"true";
}
function toggleBookmark(card){
  card.dataset.bookmarked = card.dataset.bookmarked==="true"?"false":"true";
}

// Слушатели
container.addEventListener("touchstart", handleTouchStart);
container.addEventListener("touchmove", handleTouchMove);
container.addEventListener("touchend", handleTouchEnd);

// Клик мышкой для десктопа
container.addEventListener("mousedown", (e)=>{
  startY = e.clientY;
  isDragging = true;
});
container.addEventListener("mousemove", (e)=>{
  if(!isDragging) return;
  const moveY = e.clientY - startY;
  const card = container.children[currentIndex];
  card.style.transform = `translate(-50%, calc(-50% + ${moveY}px))`;
  card.style.opacity = `${1 - Math.abs(moveY)/600}`;
});
container.addEventListener("mouseup", (e)=>{
  if(!isDragging) return;
  isDragging = false;
  const endY = e.clientY;
  const diff = endY - startY;
  const card = container.children[currentIndex];

  if(diff < -80 && currentIndex < STORIES.length-1){
    swipeNext(card,1);
  } else if(diff > 80 && currentIndex > 0){
    swipeNext(card,-1);
  } else {
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform = "translate(-50%, -50%)";
    card.style.opacity = "1";
  }
});