/* Укажи здесь username своего Telegram-бота (без @) */
const BOT_USERNAME = "your_bot_username_here";

function openBot(){
  const username = BOT_USERNAME || prompt("Введите username вашего бота:");
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
