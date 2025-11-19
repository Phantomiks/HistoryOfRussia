// Открыть телеграм-бота
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

// Галерея свайп (вертикальный drag/scroll)
const gallery = document.querySelector('.gallery-vertical');
let isDown = false, startY, scrollTop;

gallery.addEventListener('mousedown', (e)=>{
  isDown = true;
  startY = e.pageY - gallery.offsetTop;
  scrollTop = gallery.scrollTop;
});
gallery.addEventListener('mouseleave', ()=>isDown=false);
gallery.addEventListener('mouseup', ()=>isDown=false);
gallery.addEventListener('mousemove', (e)=>{
  if(!isDown) return;
  e.preventDefault();
  const y = e.pageY - gallery.offsetTop;
  const walk = (startY - y) * 1.5;
  gallery.scrollTop = scrollTop + walk;
});

// Для touch устройств
gallery.addEventListener('touchstart', (e)=>{
  startY = e.touches[0].pageY;
  scrollTop = gallery.scrollTop;
});
gallery.addEventListener('touchmove', (e)=>{
  const y = e.touches[0].pageY;
  const walk = (startY - y)
