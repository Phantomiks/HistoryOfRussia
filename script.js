// ДАННЫЕ
const cards = [
    {
        title: "1480 год — Стояние на Угре",
        description: "Окончание монголо-татарского ига и формирование независимого Русского государства."
    },
    {
        title: "1812 год — Отечественная война",
        description: "Армия Наполеона потерпела поражение после Бородино и оставления Москвы."
    },
    {
        title: "1961 год — Первый полёт в космос",
        description: "Юрий Гагарин стал первым человеком, побывавшим в космосе."
    }
];

let index = 0;

// элементы
const card = document.getElementById("card");
const title = document.getElementById("title");
const description = document.getElementById("description");

function loadCard(i) {
    title.textContent = cards[i].title;
    description.textContent = cards[i].description;
}

loadCard(index);

// Свайп
let startY = 0;

card.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
});

card.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;

    // свайп вверх
    if (startY - endY > 80) nextCard();
});

// Анимация переключения
function nextCard() {
    card.style.opacity = "0";
    card.style.transform = "translate(-50%, -65%) scale(0.9)";

    setTimeout(() => {
        index = (index + 1) % cards.length;
        loadCard(index);

        card.style.transform = "translate(-50%, -35%) scale(1.02)";
        card.style.opacity = "1";

        setTimeout(() => {
            card.style.transform = "translate(-50%, -50%) scale(1)";
        }, 150);

    }, 250);
}