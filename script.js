// Массив историй
const STORIES = [
  {date:"26 ноября 2025", desc:"Подписание важного исторического документа, которое изменило ход истории."},
  {date:"9 мая 1945", desc:"Победа в Великой Отечественной войне. День памяти и славы."},
  {date:"12 апреля 1961", desc:"Первый человек в космосе — Юрий Гагарин."},
  {date:"12 июня 1990", desc:"Принятие Декларации о государственном суверенитете России."},
  {date:"7 ноября 1917", desc:"Октябрьская революция в России, начало советской эпохи."},
  {date:"1 сентября 2023", desc:"Начало нового учебного года в российских школах."}
];

let currentIndex = 0;
let likeCounts = Array(STORIES.length).fill(0);
let bookmarked = Array(STORIES.length).fill(false);

const storyDate = document.getElementById("storyDate");
const storyDesc = document.getElementById("storyDesc");
const likeBtn = document.getElementById("likeBtn");
const likeCount = document.getElementById("likeCount");
const bookmarkBtn = document.getElementById("bookmarkBtn");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Показ истории по индексу
function showStory(index){
  const story = STORIES[index];
  storyDate.innerText = story.date;
  storyDesc.innerText = story.desc;
  likeCount.innerText = likeCounts[index];
  bookmarkBtn.innerText = bookmarked[index] ? "🔖" : "📑";
}

// Лайк
likeBtn.addEventListener("click", ()=>{
  likeCounts[currentIndex]++;
  showStory(currentIndex);
});

// Закладка
bookmarkBtn.addEventListener("click", ()=>{
  bookmarked[currentIndex] = !bookmarked[currentIndex];
  showStory(currentIndex);
});

// Навигация
nextBtn.addEventListener("click", ()=>{
  if(currentIndex < STORIES.length-1) currentIndex++;
  showStory(currentIndex);
});
prevBtn.addEventListener("click", ()=>{
  if(currentIndex > 0) currentIndex--;
  showStory(currentIndex);
});

// Инициализация
showStory(currentIndex);