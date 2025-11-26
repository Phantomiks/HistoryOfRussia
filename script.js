const TOTAL_QUESTIONS = 10;
const TIME_PER_QUESTION = 15;
const WIN_THRESHOLD = Math.ceil(TOTAL_QUESTIONS*0.6);

const QUESTIONS = [
  {q:"В каком году произошла Куликовская битва?",a:["1380","1240","1612","1480"],correct:0},
  {q:"Год Крещения Руси?",a:["988","1012","862","1132"],correct:0},
  {q:"Кто был первым российским императором?",a:["Петр I","Иван IV","Алексей","Екатерина II"],correct:0},
  {q:"Столица Золотой Орды?",a:["Сарай","Киев","Новгород","Владимир"],correct:0},
  {q:"Какой город был столицей княжества Владимирского?",a:["Владимир","Суздаль","Кострома","Ростов"],correct:0},
  {q:"Подписание Пакта Молотова–Риббентропа в каком году?",a:["1939","1941","1929","1945"],correct:0},
  {q:"Чье правление часто называют 'реформами 1860-х'?",a:["Александр II","Николай I","Петр I","Екатерина II"],correct:0},
  {q:"Битва при Бородино произошла в каком году?",a:["1812","1805","1914","1853"],correct:0},
  {q:"Кто создал первую печатную книгу на Руси?",a:["Иван Фёдоров","Пётр I","Лаврентий","Сергий"],correct:0},
  {q:"Как назывался первый русский флот?",a:["Азовский флот","Беломорский","Балтийский","Черноморский"],correct:2}
];

const screenStart=document.getElementById('screen-start');
const screenQuiz=document.getElementById('screen-quiz');
const screenEnd=document.getElementById('screen-end');
const inviteBtn=document.getElementById('inviteBtn');
const rateBtn=document.getElementById('rateBtn');
const casualBtn=document.getElementById('casualBtn');
const qIndexEl=document.getElementById('qIndex');
const questionText=document.getElementById('questionText');
const timerNum=document.getElementById('timerNum');
const progressBar=document.getElementById('progressBar');
const ansButtons=[document.getElementById('ans0'),document.getElementById('ans1'),document.getElementById('ans2'),document.getElementById('ans3')];
const endTitle=document.getElementById('endTitle');
const endScore=document.getElementById('endScore');
const modeLabel=document.getElementById('modeLabel');
const playAgainBtn=document.getElementById('playAgainBtn');

let modeRating=false,questionsSet=[],current=0,timer=null,timeLeft=TIME_PER_QUESTION,correctCount=0;

// --------- Логика ---------
function startGame(isRating){
  modeRating=isRating;
  questionsSet=shuffleArray(QUESTIONS).slice(0,TOTAL_QUESTIONS);
  current=0;correctCount=0;timeLeft=TIME_PER_QUESTION;
  modeLabel.innerText=modeRating?"Рейтинг":"Без рейтинга";
  screenStart.classList.add('hidden');screenEnd.classList.add('hidden');screenQuiz.classList.remove('hidden');
  updateProgress();showQuestion();
}

function showQuestion(){
  if(current>=questionsSet.length){finishGame();return;}
  const q=questionsSet[current];qIndexEl.innerText=`Вопрос ${current+1}/${questionsSet.length}`;questionText.innerText=q.q;
  const order=shuffleArray([0,1,2,3]);q._order=order;q._correctIndex=order.indexOf(q.correct);
  for(let i=0;i<4;i++){const btn=ansButtons[i];btn.classList.remove('correct','wrong');btn.disabled=false;btn.querySelector('.ans-text').innerText=q.a[order[i]];}
  resetTimer();startTimer();updateProgress();
}

function resetTimer(){if(timer){clearInterval(timer);timer=null}timeLeft=TIME_PER_QUESTION;timerNum.innerText=timeLeft;}
function startTimer(){timer=setInterval(()=>{timeLeft--;timerNum.innerText=timeLeft;if(timeLeft<=0){clearInterval(timer);timer=null;revealAnswer(null);setTimeout(()=>{current++;showQuestion()},900)}},1000);}
ansButtons.forEach((btn,i)=>{btn.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null}revealAnswer(i);setTimeout(()=>{current++;showQuestion()},900)})});

function revealAnswer(selected){
  const q=questionsSet[current],correctDisplayIndex=q._correctIndex;
  for(let i=0;i<4;i++){const btn=ansButtons[i];btn.disabled=true;if(i===correctDisplayIndex)btn.classList.add('correct');else if(i===selected)btn.classList.add('wrong');}
  if(selected!==null&&selected===correctDisplayIndex)correctCount++;
}

function finishGame(){
  screenQuiz.classList.add('hidden');screenEnd.classList.remove('hidden');
  const win=(correctCount>=WIN_THRESHOLD)?1:0;
  endTitle.innerText=win?"Победа!":"Игра завершена";endScore.innerText=`${correctCount} / ${questionsSet.length}`;
  modeLabel.innerText=modeRating?"Рейтинг":"Без рейтинга";
}

playAgainBtn.onclick=()=>{screenEnd.classList.add('hidden');screenStart.classList.remove('hidden');};
rateBtn.onclick=()=>startGame(true);casualBtn.onclick=()=>startGame(false);

// --------- Приглашение ---------
inviteBtn.onclick=()=>{
  const url=window.location.href+'?invite=friend';
  navigator.clipboard?.writeText(url).then(()=>alert("Ссылка скопирована! Отправь другу."))
    .catch(()=>prompt("Скопируй ссылку вручную:",url));
  alert("Ожидание друга… (нужен сервер для реального онлайн)");
}

// --------- Утилиты ---------
function shuffleArray(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a;}