// script.js — Игра с приглашением и синхронным матчем
// Работает с Telegram WebApp API для отправки результатов

// --------- Конфигурация ----------
const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;
const WIN_THRESHOLD = Math.ceil(TOTAL_QUESTIONS * 0.6);

const QUESTIONS = [
  {q: "В каком году произошла Куликовская битва?", a:["1380","1240","1612","1480"], correct:0},
  {q: "Год Крещения Руси?", a:["988","1012","862","1132"], correct:0},
  {q: "Кто был первым российским императором?", a:["Петр I","Иван IV","Алексей","Екатерина II"], correct:0},
  {q: "Столица Золотой Орды?", a:["Сарай","Киев","Новгород","Владимир"], correct:0},
  {q: "Какой город был столицей княжества Владимирского?", a:["Владимир","Суздаль","Кострома","Ростов"], correct:0},
  {q: "Подписание Пакта Молотова–Риббентропа в каком году?", a:["1939","1941","1929","1945"], correct:0},
  {q: "Чье правление часто называют 'реформами 1860-х'?", a:["Александр II","Николай I","Петр I","Екатерина II"], correct:0},
  {q: "Битва при Бородино произошла в каком году?", a:["1812","1805","1914","1853"], correct:0},
  {q: "Кто создал первую печатную книгу на Руси?", a:["Иван Фёдоров","Пётр I","Лаврентий","Сергий"], correct:0},
  {q: "Как назывался первый русский флот?", a:["Азовский флот","Беломорский","Балтийский","Черноморский"], correct:2}
];

// --------- UI элементы ----------
const screenStart = document.getElementById('screen-start');
const screenQuiz  = document.getElementById('screen-quiz');
const screenEnd   = document.getElementById('screen-end');
const screenWaiting = document.getElementById('screen-waiting'); // экран ожидания

const inviteBtn = document.getElementById('inviteBtn');
const rateBtn = document.getElementById('rateBtn');
const casualBtn = document.getElementById('casualBtn');

const qIndexEl = document.getElementById('qIndex');
const questionText = document.getElementById('questionText');
const timerNum = document.getElementById('timerNum');
const progressBar = document.getElementById('progressBar');

const ansButtons = [
  document.getElementById('ans0'),
  document.getElementById('ans1'),
  document.getElementById('ans2'),
  document.getElementById('ans3')
];

const endTitle = document.getElementById('endTitle');
const endScore = document.getElementById('endScore');
const modeLabel = document.getElementById('modeLabel');
const sendResultBtn = document.getElementById('sendResultBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

let modeRating = false;
let questions = [];
let current = 0;
let timer = null;
let timeLeft = TIME_PER_QUESTION;
let correctCount = 0;
let userId = null;

// --------- Telegram WebApp ----------
let tg = window.Telegram ? window.Telegram.WebApp : null;
if(tg){
    try{
        const info = tg.initDataUnsafe && tg.initDataUnsafe.user;
        if(info && info.id) userId = info.id;
        tg.expand();
    } catch(e){ console.warn("Telegram init error", e); }
}

// --------- WebSocket и логика приглашения ----------
let ws = null;
let playerId = Math.floor(Math.random()*1000000);
let opponentId = null;
let gameId = getQueryParam("gameId"); // если игрок пришел по приглашению

function initWebSocket(isInvite){
    ws = new WebSocket("wss://ВАШ_ДОМЕН/ws");
    ws.onopen = () => {
        if(isInvite){
            ws.send(JSON.stringify({type:"join_game", playerId, gameId}));
            showWaitingScreen();
        }
    };
    ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if(data.type==="start_game"){
            hideWaitingScreen();
            questions = data.questions;
            startGame(modeRating);
        }
    };
}

// --------- Экран ожидания ---------
function showWaitingScreen(){
    screenStart.classList.add('hidden');
    screenQuiz.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenWaiting.classList.remove('hidden');
}
function hideWaitingScreen(){
    screenWaiting.classList.add('hidden');
}

// --------- Мод выбора режима ---------
if(gameId){
    // игрок пришел по ссылке
    initWebSocket(true);
}else{
    inviteBtn.addEventListener('click', ()=>{
        gameId = Date.now() + "_" + Math.floor(Math.random()*10000);
        const url = `${window.location.href}?gameId=${gameId}`;
        tg.openLink ? tg.openLink(url) : navigator.clipboard?.writeText(url).then(()=> alert("Ссылка скопирована! Отправь другу."));
        initWebSocket(false);
        showWaitingScreen();
    });

    rateBtn.addEventListener('click', ()=> startGame(true));
    casualBtn.addEventListener('click', ()=> startGame(false));
}

// --------- Старт игры ----------
function startGame(isRating){
    modeRating = !!isRating;
    if(!questions.length) questions = shuffleArray(QUESTIONS).slice(0,TOTAL_QUESTIONS);
    current = 0;
    correctCount = 0;
    timeLeft = TIME_PER_QUESTION;

    modeLabel.innerText = modeRating ? "Рейтинг" : "Без рейтинга";
    screenStart.classList.add('hidden');
    screenEnd.classList.add('hidden');
    screenQuiz.classList.remove('hidden');

    updateProgress();
    showQuestion();
}

// --------- Показ вопроса ----------
function showQuestion(){
    if(current>=questions.length){ finishGame(); return; }
    const q = questions[current];
    qIndexEl.innerText = `Вопрос ${current+1}/${questions.length}`;
    questionText.innerText = q.q;

    const order = shuffleArray([0,1,2,3]);
    q._order = order;
    q._correctIndex = order.indexOf(q.correct);

    for(let i=0;i<4;i++){
        const btn = ansButtons[i];
        btn.classList.remove('correct','wrong');
        btn.disabled=false;
        btn.querySelector('.ans-text').innerText = q.a[order[i]];
    }

    resetTimer();
    startTimer();
    updateProgress();
}

// --------- Таймер ----------
function resetTimer(){
    if(timer){ clearInterval(timer); timer=null; }
    timeLeft = TIME_PER_QUESTION;
    timerNum.innerText = timeLeft;
}
function startTimer(){
    timer = setInterval(()=>{
        timeLeft--;
        timerNum.innerText = timeLeft;
        animateTimerPulse();
        if(timeLeft<=0){
            clearInterval(timer); timer=null;
            revealAnswer(null);
            setTimeout(()=>{current++; showQuestion();},900);
        }
    },1000);
}
function animateTimerPulse(){
    const el = document.getElementById('timer');
    el.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],
        {duration:420, easing:'ease'});
}

// --------- Выбор ответа ----------
ansButtons.forEach((btn,i)=>{
    btn.addEventListener('click', ()=>{
        if(timer){ clearInterval(timer); timer=null; }
        revealAnswer(i);
        setTimeout(()=>{current++; showQuestion();},900);
    });
});
function revealAnswer(selected){
    const q = questions[current];
    const correctDisplayIndex = q._correctIndex;
    for(let i=0;i<4;i++){
        const btn = ansButtons[i];
        btn.disabled=true;
        if(i===correctDisplayIndex) btn.classList.add('correct');
        else if(i===selected) btn.classList.add('wrong');
    }
    if(selected!==null && selected===correctDisplayIndex) correctCount++;
}

// --------- Конец игры ----------
function finishGame(){
    screenQuiz.classList.add('hidden');
    screenEnd.classList.remove('hidden');

    const win = (correctCount>=WIN_THRESHOLD)?1:0;
    endTitle.innerText = win?"Победа!":"Игра завершена";
    endScore.innerText = `${correctCount} / ${questions.length}`;
    modeLabel.innerText = modeRating?"Рейтинг":"Без рейтинга";

    sendResultBtn.onclick = ()=> sendResultToBot(win, correctCount);
    playAgainBtn.onclick = ()=>{
        screenEnd.classList.add('hidden');
        screenStart.classList.remove('hidden');
    };
}

// --------- Отправка результата боту ----------
function sendResultToBot(win, points){
    const uid = userId||0;
    const payload = `result:${uid}:${win}:${points}`;
    if(tg && tg.sendData){
        try{ tg.sendData(payload); alert("Результат отправлен боту."); }
        catch(e){ alert("Ошибка отправки: "+e); }
    } else {
        navigator.clipboard?.writeText(payload).then(()=> alert("Результат скопирован, вставь боту"))
            .catch(()=> prompt("Скопируй результат и отправь боту:", payload));
    }
}

// --------- Утилиты ----------
function shuffleArray(arr){
    const a=arr.slice();
    for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
}
function updateProgress(){
    const pct = Math.round((current/TOTAL_QUESTIONS)*100);
    progressBar.style.width = pct+"%";
}
function getQueryParam(name){
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}