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

// Горизонтальная карусель с drag/snap
const gallery = document.querySelector('.gallery-horizontal');
let isDown = false, startX, scrollLeft;

gallery.addEventListener('mousedown', e=>{
  isDown=true;
  gallery.classList.add('grabbing');
  startX=e.pageX - gallery.offsetLeft;
  scrollLeft=gallery.scrollLeft;
});
gallery.addEventListener('mouseleave', ()=>{isDown=false; gallery.classList.remove('grabbing');});
gallery.addEventListener('mouseup', ()=>{isDown=false; gallery.classList.remove('grabbing'); snapToCard();});
gallery.addEventListener('mousemove', e=>{
  if(!isDown) return;
  e.preventDefault();
  const x=e.pageX - gallery.offsetLeft;
  const walk=(startX - x);
  gallery.scrollLeft = scrollLeft + walk;
});

// Touch support
gallery.addEventListener('touchstart', e=>{
  startX = e.touches[0].pageX - gallery.offsetLeft;
  scrollLeft = gallery.scrollLeft;
});
gallery.addEventListener('touchmove', e=>{
  const x = e.touches[0].pageX - gallery.offsetLeft;
  const walk = startX - x;
  gallery.scrollLeft = scrollLeft + walk;
});
gallery.addEventListener('touchend', snapToCard);

// Snap функция на ближайшую карточку
function snapToCard(){
  const cards = [...gallery.querySelectorAll('.media-card')];
 
