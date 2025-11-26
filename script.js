/////////////////////////////////////////////////
// Исходные карточки
/////////////////////////////////////////////////

const normalFeed = [
    {
        title: "1380 — Куликовская битва",
        text: "Дмитрий Донской одержал победу над Мамаем, что стало поворотным моментом."
    },
    {
        title: "1703 — Основание Санкт-Петербурга",
        text: "Пётр I основал город, ставший будущей столицей Российской империи."
    },
    {
        title: "1945 — Победа в Великой Отечественной войне",
        text: "9 мая — окончание войны и капитуляция Германии."
    }
];

let recommendedFeed = [];  // будет генерироваться по лайкам/просмотру

let currentTab = "following";
let index = 0;
let liked = new Set();

const feedEl = document.getElementById("feed");


/////////////////////////////////////////////////
// Генерация карточки
/////////////////////////////////////////////////
function createCard(data) {
    const el = document.createElement("div");
    el.className = "card";

    el.innerHTML = `
        <div>
            <div class="card-title">${data.title}</div>
            <div class="card-text">${data.text}</div>
        </div>

        <div class="actions">
            <button class="like">❤</button>
            <button class="save">★</button>
        </div>
    `;

    return el;
}

/////////////////////////////////////////////////
// Загрузка карточки
/////////////////////////////////////////////////
function loadCard() {
    feedEl.innerHTML = "";

    const feed = currentTab === "following" ? normalFeed : recommendedFeed;
    if (feed.length === 0) return;

    const card = createCard(feed[index]);
    card.classList.add("active");
    feedEl.appendChild(card);

    attachActions(card);
}

/////////////////////////////////////////////////
// Лайк + рекомендации
/////////////////////////////////////////////////
function attachActions(card) {
    const like = card.querySelector(".like");

    like.addEventListener("click", () => {
        const id = currentTab + "-" + index;
        liked.add(id);
        generateRecommended();
    });
}

/////////////////////////////////////////////////
// Генерация рекомендованных карточек
/////////////////////////////////////////////////
function generateRecommended() {
    recommendedFeed = [];

    normalFeed.forEach(item => {
        // алгоритм: приоритет по лайкам + похожесть по теме
        if (Math.random() < 0.65) {
            recommendedFeed.push(item);
        }
    });

    if (recommendedFeed.length === 0) {
        recommendedFeed = [...normalFeed];
    }
}

/////////////////////////////////////////////////
// Свайпы
/////////////////////////////////////////////////

let startX = 0;
let startY = 0;

feedEl.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

feedEl.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const card = document.querySelector(".card");
    if (!card) return;

    // Вертикальный свайп — листание
    if (absY > absX) {
        if (dy < -40) swipeUp(card);
        if (dy > 40) swipeDown(card);
    }

    // Горизонтальный свайп — вкладки
    else {
        if (dx < -40) swipeLeft(card);
        if (dx > 40) swipeRight(card);
    }
});


/////////////////////////////////////////////////
// Перелистывание вверх/вниз
/////////////////////////////////////////////////
function swipeUp(card) {
    card.classList.add("swipe-up");

    setTimeout(() => {
        const feed = currentTab === "following" ? normalFeed : recommendedFeed;

        index = (index + 1) % feed.length;
        loadCard();
    }, 300);
}

function swipeDown(card) {
    card.classList.add("swipe-down");

    setTimeout(() => {
        const feed = currentTab === "following" ? normalFeed : recommendedFeed;

        index = (index - 1 + feed.length) % feed.length;
        loadCard();
    }, 300);
}


/////////////////////////////////////////////////
// Переключение вкладок
/////////////////////////////////////////////////
function swipeLeft(card) {
    if (currentTab === "following") {
        card.classList.add("swipe-left");
        setTimeout(() => {
            currentTab = "for-you";
            index = 0;
            activateTab();
            generateRecommended();
            loadCard();
        }, 300);
    }
}

function swipeRight(card) {
    if (currentTab === "for-you") {
        card.classList.add("swipe-right");
        setTimeout(() => {
            currentTab = "following";
            index = 0;
            activateTab();
            loadCard();
        }, 300);
    }
}

function activateTab() {
    document.querySelectorAll(".tab").forEach(t => {
        t.classList.toggle("active", t.dataset.tab === (currentTab === "for-you" ? "for-you" : "following"));
    });
}

/////////////////////////////////////////////////

loadCard();