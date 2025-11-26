// Настройка Telegram WebApp
let tg = window.Telegram ? window.Telegram.WebApp : null;
let userId = tg?.initDataUnsafe?.user?.id || 0;

// Вопросы
const QUESTIONS = [
  {q: "В каком году произошла Куликовская битва?", a:["1380","1240","1612","1480"], correct:0},
  {q: "Год Крещения Руси?", a:["988","1012","862","1132"], correct:0},
  {q: "Кто был первым российским императором?", a:["Петр I","Иван IV","Алексей","Екатерина II"], correct:0},
  {q: "Столица Золотой Орды?", a:["Сарай","Киев","Новгород","Владимир"], correct:0}
];

let currentIndex = 0;
let correctCount = 0;

// Phaser config
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 600,
  height: 800,
  backgroundColor: 0x071025,
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.html('questionform', ''); // можно вставлять HTML через Phaser
}

function create() {
  showQuestion.call(this, currentIndex);
}

function update() {}

function showQuestion(idx) {
  if(idx >= QUESTIONS.length){
    finishGame();
    return;
  }

  const q = QUESTIONS[idx];

  // Слой фона
  const bg = this.add.rectangle(300,400,550,400,0x0b1220).setAlpha(0.9).setStrokeStyle(2,0x7c3aed,0.6).setOrigin(0.5).setRadius(20);

  const title = this.add.text(300, 300, q.q, {
    font: '20px Inter',
    color: '#e6eef8',
    wordWrap: { width: 500 }
  }).setOrigin(0.5);

  // Кнопки ответов
  const buttons = [];
  q.a.forEach((ans,i)=>{
    const btn = this.add.text(300, 370 + i*60, ans, {
      font: '18px Inter',
      backgroundColor: '#1e293b',
      color: '#fff',
      padding: {x:10,y:10},
      align: 'center'
    }).setOrigin(0.5).setInteractive();

    btn.on('pointerdown', ()=>{
      if(i === q.correct) correctCount++;
      currentIndex++;
      this.scene.restart();
    });

    buttons.push(btn);
  });
}

function finishGame(){
  document.getElementById('game-container').style.display = 'none';
  const endScreen = document.getElementById('endScreen');
  endScreen.classList.remove('hidden');
  document.getElementById('endScore').innerText = `Правильных ответов: ${correctCount}/${QUESTIONS.length}`;

  document.getElementById('sendResultBtn').onclick = ()=>{
    const payload = `result:${userId}:${correctCount}`;
    if(tg?.sendData) tg.sendData(payload);
    else alert('Результат: '+payload);
  };

  document.getElementById('playAgainBtn').onclick = ()=>{
    location.reload();
  };
}
