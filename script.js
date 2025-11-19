// Telegram кнопка
const BOT_USERNAME = "Hist0ry_of_Russia_bot";
function openBot(){
  if(!BOT_USERNAME) return;
  window.open("https://t.me/" + BOT_USERNAME,"_blank");
}

// Плавный скролл внутренних ссылок
document.addEventListener("click",(e)=>{
  const a = e.target.closest('a[href^="#"]');
  if(!a) return;
  e.preventDefault();
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
});

// Горизонтальная галерея (как раньше)
const gallery = document.querySelector('.gallery-horizontal');
let isDown = false, startX, scrollLeft;

// Drag мышью
gallery.addEventListener('mousedown', e=>{
  isDown = true;
  gallery.classList.add('grabbing');
  startX = e.pageX - gallery.offsetLeft;
  scrollLeft = gallery.scrollLeft;
});
gallery.addEventListener('mouseleave', ()=>{ isDown=false; gallery.classList.remove('grabbing'); snapToCard(); });
gallery.addEventListener('mouseup', ()=>{ isDown=false; gallery.classList.remove('grabbing'); snapToCard(); });
gallery.addEventListener('mousemove', e=>{
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX - gallery.offsetLeft;
  const walk = startX - x;
  gallery.scrollLeft = scrollLeft + walk;
});

// Touch свайп
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

// Snap к ближайшей карточке
function snapToCard(){
  const cards = [...gallery.querySelectorAll('.media-card')];
  const galleryCenter = gallery.scrollLeft + gallery.offsetWidth/2;
  let closest = cards[0];
  let closestDiff = Math.abs((cards[0].offsetLeft + cards[0].offsetWidth/2) - galleryCenter);

  for(const card of cards){
    const cardCenter = card.offsetLeft + card.offsetWidth/2;
    const diff = Math.abs(cardCenter - galleryCenter);
    if(diff < closestDiff){
      closest = card;
      closestDiff = diff;
    }
  }
  gallery.scrollTo({left: closest.offsetLeft, behavior: 'smooth'});
}

// --- Эффект увеличения темы при вертикальной прокрутке ---
const themeCards = [...document.querySelectorAll('.theme-card')];

function updateActiveThemeOnScroll() {
  const windowCenter = window.innerHeight / 2;

  themeCards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const cardCenter = rect.top + rect.height / 2;
    const distance = Math.abs(windowCenter - cardCenter);

    if(distance < rect.height / 2) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Отслеживаем вертикальный скролл
window.addEventListener('scroll', updateActiveThemeOnScroll);
window.addEventListener('resize', updateActiveThemeOnScroll);
updateActiveThemeOnScroll();

