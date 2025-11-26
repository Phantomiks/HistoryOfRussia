const TOTAL_QUESTIONS = 5;
const TIME_PER_QUESTION = 15;

const QUESTIONS = [
  {q:"1380 — Куликовская битва", a:["1380","1240","1612","1480"], correct:0},
  {q:"1703 — Основание Санкт-Петербурга", a:["1700","1703","1712","1720"], correct:1},
  {q:"1945 — Победа в ВОВ", a:["1941","1943","1945","1944"], correct:2},
  {q:"Кто создал первый флот?", a:["Петр I","Иван IV","Алексей","Екатерина II"], correct:0},
  {q:"Год Крещения Руси", a:["988","1012","862","1132"], correct:0}
];

let current = 0;
let correctCount = 0;
let timer = null;
let timeLeft = TIME_PER_QUESTION;

// Элементы
const screenStart = document.getElementById('screen-start');
const screenQuiz  = document.getElementById('screen-quiz');
const screenCab   = document.getElementById('screen-cabinet');
const questionText = document.getElementById('questionText');
const qIndexEl = document.getElementById('qIndex');
const timerEl = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const ansButtons = [0,1,2,3].map(i=>document.getElementById('ans'+i));

const soloBtn = document.getElementById('soloBtn');
const duelBtn = document.getElementById('duelBtn');
const cabinetBtn = document.getElementById('cabinetBtn');
const backBtn = document.getElementById('backBtn');

soloBtn.onclick = ()=>startGame();
cabinetBtn.onclick = ()=>{screenStart.classList.add('hidden'); screenCab.classList.remove('hidden');};
backBtn.onclick = ()=>{screenCab.classList.add('hidden'); screenStart.classList.remove('hidden');};

function startGame(){
  screenStart.classList.add('hidden');
  screenQuiz.classList.remove('hidden');
  current=0; correctCount=0;
  loadQuestion();
}

function loadQuestion(){
  if(current>=QUESTIONS.length){finishGame(); return;}
  const q = QUESTIONS[current];
  qIndexEl.innerText = `Вопрос ${current+1}/${QUESTIONS.length}`;
  questionText.innerText = q.q;
  ansButtons.forEach((btn,i)=>{
    btn.classList.remove('correct','wrong');
    btn.disabled=false;
    btn.querySelector('.ans-text').innerText = q.a[i];
    btn.onclick = ()=>selectAnswer(i);
  });
  timeLeft = TIME_PER_QUESTION;
  timerEl.innerText = timeLeft;
  if(timer) clearInterval(timer);
  timer = setInterval(()=>{
    timeLeft--;
    timerEl.innerText = timeLeft;
    if(timeLeft<=0){ clearInterval(timer); selectAnswer(-1);}
  },1000);
}

function selectAnswer(i){
  clearInterval(timer);
  const q = QUESTIONS[current];
  ansButtons.forEach((btn,idx)=>{
    btn.disabled=true;
    if(idx===q.correct) btn.classList.add('correct');
    else if(idx===i) btn.classList.add('wrong');
  });
  if(i===q.correct) correctCount++;
  current++;
  setTimeout(loadQuestion,800);
}

function finishGame(){
  screenQuiz.classList.add('hidden');
  screenCab.classList.remove('hidden');
  document.getElementById('userPoints').innerText = correctCount;
}
