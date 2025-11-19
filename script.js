// Открыть телеграм-канал/бота
const BOT_USERNAME = "Hist0ry_of_Russia_bot";
function openBot(){
  if(!BOT_USERNAME) return;
  window.open("https://t.me/" + BOT_USERNAME, "_blank");
}

// Плавный скролл для внутренних ссылок
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  e.preventDefault();
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
});
