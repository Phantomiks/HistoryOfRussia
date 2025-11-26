// ----------------- Telegram WebApp -----------------
let tg = window.Telegram ? window.Telegram.WebApp : null;
let userId = null;
let username = "Гость";
let avatar = "https://via.placeholder.com/80";

const usernameEl = document.getElementById("username");
const userIdEl = document.getElementById("userId");
const avatarEl = document.getElementById("avatar");

// ----------------- Stats -----------------
let level = 1;
let points = 0;
let tasksDone = 0;
let streak = 0;
let history = [];

const levelEl = document.getElementById("level");
const pointsEl = document.getElementById("points");
const tasksEl = document.getElementById("tasksDone");
const streakEl = document.getElementById("streakCount");
const levelProgress = document.getElementById("levelProgress");
const historyList = document.getElementById("historyList");

// ----------------- Achievements -----------------
const achievements = [
  {id:1,name:"Новичок",desc:"Зарегистрировался в боте",earned:false},
  {id:2,name:"Победитель",desc:"Выиграл первую викторину",earned:false},
  {id:3,name:"Историк",desc:"Прочитал 10 карточек",earned:false},
  {id:4,name:"Реферал",desc:"Пригласил друга",earned:false},
];
const achievementsGrid = document.getElementById("achievementsGrid");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalClose = document.getElementById("modalClose");

// ----------------- Telegram login -----------------
if(tg){
    const info = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if(info){
        userId = info.id;
        username = info.first_name + (info.last_name? " "+info.last_name:"");
        avatar = info.photo_url || avatar;
    }
}
usernameEl.innerText = username;
userIdEl.innerText = "ID: "+(userId||"-");
avatarEl.src = avatar;

// ----------------- Render Achievements -----------------
function renderAchievements(){
    achievementsGrid.innerHTML="";
    achievements.forEach(a=>{
        const el = document.createElement("div");
        el.className="achievement";
        el.innerText = a.earned ? "🏆" : "🏅";
        el.title = a.name;
        el.addEventListener("click", ()=>{
            modalTitle.innerText = a.name;
            modalDesc.innerText = a.desc;
            modal.classList.remove("hidden");
        });
        achievementsGrid.appendChild(el);
    });
}
renderAchievements();

// ----------------- Modal -----------------
modalClose.addEventListener("click",()=> modal.classList.add("hidden"));
modal.addEventListener("click", e=> {if(e.target===modal) modal.classList.add("hidden");});

// ----------------- Referral -----------------
const copyLinkBtn = document.getElementById("copyLink");
copyLinkBtn.addEventListener("click", ()=>{
    const link = "https://t.me/your_bot?start="+(userId||"guest");
    navigator.clipboard?.writeText(link)
      .then(()=> alert("Ссылка скопирована!"))
      .catch(()=> prompt("Скопируй ссылку:", link));
});

// ----------------- Update Stats -----------------
function updateStats(){
    levelEl.innerText = level;
    pointsEl.innerText = points;
    tasksEl.innerText = tasksDone;
    streakEl.innerText = streak;
    levelProgress.style.width = (points%100)+"%";
    renderAchievements();
    renderHistory();
}

// ----------------- History -----------------
function addHistory(text){
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    history.unshift(timeStr+" — "+text);
    if(history.length>20) history.pop();
    renderHistory();
}

function renderHistory(){
    historyList.innerHTML="";
    history.forEach(h=>{
        const li = document.createElement("li");
        li.innerText = h;
        historyList.appendChild(li);
    });
}

// ----------------- Example actions -----------------
function completeTask(name, pointsEarned){
    tasksDone++;
    points+=pointsEarned;
    streak++;
    addHistory(`Выполнил: ${name} (+${pointsEarned} очков)`);

    // Проверка ачивок
    if(tasksDone>=1) achievements[1].earned=true;
    if(tasksDone>=10) achievements[2].earned=true;

    updateStats();
}

// Имитируем первый вход
completeTask("Вход в бот", 10);
