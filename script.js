/* Подключение Telegram-бота */
const BOT_USERNAME = "Hist0ry_of_Russia_bot";

function openBot(){
  const username = BOT_USERNAME;
  if(!username) return;
  window.open("https://t.me/" + username, "_blank");
}

/* Плавный скролл */
document.addEventListener("click", e=>{
  if(e.target.matches('a[href^="#"]')){
    e.preventDefault();
    const id = e.target.getAttribute("href").substring(1);
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:"smooth"});
  }
});
