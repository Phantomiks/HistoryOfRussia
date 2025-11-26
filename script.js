const STORIES = [
  {date:"9 мая 1945", desc:"День Победы. Капитуляция нацистской Германии."},
  {date:"12 апреля 1961", desc:"Юрий Гагарин совершил первый полёт в космос."},
  {date:"7 ноября 1917", desc:"Октябрьская революция в России."},
  {date:"26 апреля 1986", desc:"Катастрофа на Чернобыльской АЭС."},
  {date:"1 сентября 1939", desc:"Начало Второй мировой войны."}
];

const container = document.getElementById("container");
let currentIndex = 0;

/* ------------ Создание карточек ------------ */
function createCard(index, position = 0){
  const data = STORIES[index];
  if(!data) return null;

  const card = document.createElement("div");
  card.className = "card";
  card.style.transform = `translateY(${position*100}%)`;

  card.innerHTML = `
    <div class="card-inner">
      <div class="date">${data.date}</div>
      <div class="desc">${data.desc}</div>
    </div>

    <div class="actions">
      <div class="action-btn">❤</div>
      <div class="action-btn">🔖</div>
    </div>
  `;

  return card;
}

/* ------------ Начальная загрузка ------------ */
let activeCard = createCard(0, 0);
let nextCard = createCard(1, 1);
let prevCard = null;

container.appendChild(activeCard);
container.appendChild(nextCard);

/* ------------ Swipe логика (TikTok-клон) ------------ */
let startY = 0;
let deltaY = 0;
let isDragging = false;

function start(e){
  isDragging = true;
  startY = e.touches ? e.touches[0].clientY : e.clientY;
}

function move(e){
  if(!isDragging) return;

  const y = e.touches ? e.touches[0].clientY : e.clientY;
  deltaY = y - startY;

  activeCard.style.transform = `translateY(${deltaY}px)`;
  if(nextCard) nextCard.style.transform = `translateY(${100 + deltaY/2}px)`;
  if(prevCard) prevCard.style.transform = `translateY(${-100 + deltaY/2}px)`;
}

function end(){
  isDragging = false;

  /* Swipe Up (next) */
  if(deltaY < -120 && nextCard){
    activeCard.style.transform = "translateY(-100%)";
    nextCard.style.transform = "translateY(0%)";

    setTimeout(()=>{
      currentIndex++;
      refreshCards();
    },300);
  }
  /* Swipe Down (previous) */
  else if(deltaY > 120 && prevCard){
    activeCard.style.transform = "translateY(100%)";
    prevCard.style.transform = "translateY(0%)";

    setTimeout(()=>{
      currentIndex--;
      refreshCards();
    },300);
  }
  else{
    activeCard.style.transform = "translateY(0%)";
    if(nextCard) nextCard.style.transform = "translateY(100%)";
    if(prevCard) prevCard.style.transform = "translateY(-100%)";
  }

  deltaY = 0;
}

/* ------------ Обновление карточек после свайпа ------------ */
function refreshCards(){
  container.innerHTML = "";

  activeCard = createCard(currentIndex, 0);
  nextCard   = createCard(currentIndex + 1, 1);
  prevCard   = createCard(currentIndex - 1, -1);

  if(prevCard) container.appendChild(prevCard);
  container.appendChild(activeCard);
  if(nextCard) container.appendChild(nextCard);
}

/* ------------ Подключение событий ------------ */
container.addEventListener("touchstart", start);
container.addEventListener("touchmove",  move);
container.addEventListener("touchend",   end);

container.addEventListener("mousedown", start);
container.addEventListener("mousemove", move);
container.addEventListener("mouseup",   end);