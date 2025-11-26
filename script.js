const STORIES = [
  {date:"26 ноября 2025", desc:"Подписание важного исторического документа, которое изменило ход истории."},
  {date:"9 мая 1945", desc:"Победа в Великой Отечественной войне. День памяти и славы."},
  {date:"12 апреля 1961", desc:"Первый человек в космосе — Юрий Гагарин."},
  {date:"12 июня 1990", desc:"Принятие Декларации о государственном суверенитете России."},
  {date:"7 ноября 1917", desc:"Октябрьская революция в России, начало советской эпохи."},
  {date:"1 сентября 2023", desc:"Начало нового учебного года в российских школах."}
];

const container = document.getElementById("storyContainer");
let currentIndex = 0;

// Создание карточек
STORIES.forEach((story, i)=>{
  const card = document.createElement("div");
  card.className = "story-card";
  card.style.zIndex = STORIES.length - i;

  card.innerHTML = `
    <h2 class="story-date">${story.date}</h2>
    <p class="story-desc">${story.desc}</p>
    <div class="story-actions">
      <button class="action-btn like">❤️</button>
      <button class="action-btn bookmark">🔖</button>
    </div>
  `;

  container.appendChild(card);
});

// Свайп и анимация
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
    // свайп вверх
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform = "translate(-50%, -150%)";
    card.style.opacity = "0";
    currentIndex++;
    setTimeout(()=>{resetCard(card)}, 300);
  } else if(diff > 80 && currentIndex > 0){
    // свайп вниз
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform = "translate(-50%, 150%)";
    card.style.opacity = "0";
    currentIndex--;
    setTimeout(()=>{resetCard(card)}, 300);
  } else {
    // возвращаем на место
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease";
    card.style.transform = "translate(-50%, -50%)";
    card.style.opacity = "1";
  }
}

function resetCard(card){
  card.style.transition = "none";
  card.style.transform = "translate(-50%, -50%)";
  card.style.opacity = "1";
}

container.addEventListener("touchstart", handleTouchStart);
container.addEventListener("touchmove", handleTouchMove);
container.addEventListener("touchend", handleTouchEnd);