const STORIES = [
  {date:"26 ноября 2025", desc:"Подписание важного документа, изменившего историю."},
  {date:"9 мая 1945", desc:"Победа в Великой Отечественной войне."},
  {date:"12 апреля 1961", desc:"Первый человек в космосе — Юрий Гагарин."},
  {date:"12 июня 1990", desc:"Принятие Декларации о государственном суверенитете России."},
  {date:"7 ноября 1917", desc:"Октябрьская революция в России."},
  {date:"1 сентября 2023", desc:"Начало нового учебного года в школах России."}
];

const feed = document.getElementById("storyFeed");

STORIES.forEach(story=>{
  const card = document.createElement("div");
  card.className = "story-card";
  card.innerHTML = `
    <h2 class="story-date">${story.date}</h2>
    <p class="story-desc">${story.desc}</p>
  `;
  feed.appendChild(card);
});