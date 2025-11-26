// ===== Элементы =====
const screenStart = document.getElementById('screen-start');
const screenQuiz = document.getElementById('screen-quiz');
const screenEnd = document.getElementById('screen-end');
const screenWaiting = document.getElementById('screen-waiting');

const inviteBtn = document.getElementById('inviteBtn');
const rateBtn = document.getElementById('rateBtn');
const casualBtn = document.getElementById('casualBtn');

const qIndexEl = document.getElementById('qIndex');
const questionText = document.getElementById('questionText');
const timerNum = document.getElementById('timer');
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
const playAgainBtn = document.getElementById('playAgainBtn');

let modeRating = false;
let questions = [];
let current = 0;
let timer = null;
let timeLeft = 15;
let correctCount = 0;
let playerId = Math.floor(Math.random()*1000000);
let gameId = getQueryParam("gameId");

// ===== Конфигурация =====
const TOTAL_QUESTIONS = 5;
const TIME_PER_QUESTION = 15;
const WIN_THRESHOLD = Math.ceil(TOTAL_QUESTIONS*0.6);

// ===== Пример вопросов =====
const QUESTIONS = [
  {q:"В каком году произошла Куликовская битва?", a:["1380","1240","1612","1480"], correct:0},
  {q:"Год Крещения Руси?", a:["988","1012","862","1132"], correct:0},
  {q:"Кто был первым российским императором?", a:["Петр I","Иван IV","Алексей","Екатерина II"], correct:0},
  {q:"Столица Золотой Орды?", a:["Сарай","Киев","Новгород","Владимир"], correct:0},
  {q:"Какой город был столицей княжества Владимирского?", a:["Владимир","Суздаль","Кострома","Ростов"], correct:0}
];

// ===== WebSocket для онлайн =====
let ws = null;

function initWS(isInvite){
    ws = new WebSocket("wss://ВАШ_ДОМЕН/ws");
    ws.onopen = ()=>{
        if(isInvite){
            ws.send(JSON.stringify({type:"join_game", playerId, gameId}));
            screenWaiting.classList.remove('hidden');
            screenStart.classList.add('hidden');
        }
    };
    ws.onmessage = (msg)=>{
        const data = JSON.parse(msg.data);
        if(data.type==="waiting"){
            screenWaiting.classList.remove('hidden');
        }
        if(data.type==="start_game"){
            questions = data.questions;
            screenWaiting.classList.add('hidden');
            startGame(modeRating);
        }
    };
}

// ===== Кнопки главного меню =====
if(gameId){
    initWS(true);
}else{
    inviteBtn.onclick = ()=>{
        gameId = Date.now()+"_"+Math.floor(Math.random()*1000);
        const url = `${window.location.href}?gameId=${gameId}`;
        navigator.clipboard.writeText(url).then(()=>alert("Ссылка скопирована! Отправь другу."));
        initWS(false);
        screenWaiting.classList.remove('hidden');
        screenStart.classList.add('hidden');
    };
    rateBtn.onclick = ()=> startGame(true);
    casualBtn.onclick = ()=> startGame(false);
}

// ===== Игровая логика =====
function startGame(isRating){
    modeRating = !!isRating;
    if(!questions.length) questions = shuffleArray(QUESTIONS).slice(0,TOTAL_QUESTIONS);
    current=0; correctCount=0; timeLeft=TIME_PER_QUESTION;
    screenStart.classList.add('hidden'); screenQuiz.classList.remove('hidden');
    modeLabel.innerText = modeRating?"Рейтинг":"Без рейтинга";
    showQuestion();
}

function showQuestion(){
    if(current>=questions.length){ finishGame(); return; }
    const q = questions[current];
    qIndexEl.innerText = `Вопрос ${current+1}/${questions.length}`;
    questionText.innerText = q.q;
    const order = shuffleArray([0,1,2,3]);
    q._order = order; q._correctIndex = order.indexOf(q.correct);
    for(let i=0;i<4;i++){
        const btn = ansButtons[i];
        btn.disabled=false;
        btn.classList.remove('correct','wrong');
        btn.querySelector('.ans-text').innerText = q.a[order[i]];
        btn.onclick = ()=>{ answer(i); };
    }
    resetTimer(); startTimer();
}

function resetTimer(){ if(timer) clearInterval(timer); timeLeft=TIME_PER_QUESTION; timerNum.innerText=timeLeft; progressBar.style.width="0%";}
function startTimer(){ timer=setInterval(()=>{ timeLeft--; timerNum.innerText=timeLeft; progressBar.style.width=`${Math.round((TIME_PER_QUESTION-timeLeft)/TIME_PER_QUESTION*100)}%`; if(timeLeft<=0){ clearInterval(timer); revealAnswer(null); setTimeout(()=>{current++; showQuestion();},900); } },1000);}
function answer(idx){ clearInterval(timer); revealAnswer(idx); setTimeout(()=>{current++; showQuestion();},900);}
function revealAnswer(selected){ const q = questions[current]; const correct = q._correctIndex; for(let i=0;i<4;i++){ const btn=ansButtons[i]; btn.disabled=true; if(i===correct) btn.classList.add('correct'); else if(i===selected) btn.classList.add('wrong'); } if(selected===correct) correctCount++; }
function finishGame(){ screenQuiz.classList.add('hidden'); screenEnd.classList.remove('hidden'); const win = (correctCount>=WIN_THRESHOLD)?1:0; endTitle.innerText=win?"Победа!":"Игра завершена"; endScore.innerText=`${correctCount}/${questions.length}`; modeLabel.innerText=modeRating?"Рейтинг":"Без рейтинга"; sendResult(win, correctCount); playAgainBtn.onclick=()=>{screenEnd.classList.add('hidden'); screenStart.classList.remove('hidden');};}
function sendResult(win, score){ if(ws && ws.readyState===WebSocket.OPEN){ ws.send(JSON.stringify({type:"result", win, score, playerId, gameId})); } }
function shuffleArray(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function getQueryParam(name){ return new URLSearchParams(window.location.search).get(name); }