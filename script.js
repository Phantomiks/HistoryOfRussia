// Данные карточек
let cards = [
    { id: 1, date: "01.01.2025", text: "Сегодня произошло...", liked: false, saved: false },
    { id: 2, date: "02.01.2025", text: "Интересное событие...", liked: false, saved: false },
    { id: 3, date: "03.01.2025", text: "Что же было сегодня?", liked: false, saved: false },
];

let currentTab = "normal";

function renderCards() {
    const container = document.getElementById("card-container");
    container.innerHTML = "";

    let list = currentTab === "normal"
        ? cards
        : cards.filter(c => c.liked === true);

    list.forEach(card => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <div class="card-title">${card.date}</div>
            <div class="card-text">${card.text}</div>

            <div class="actions">
                <span class="icon ${card.liked ? 'liked' : ''}" onclick="toggleLike(${card.id})">❤️</span>
                <span class="icon ${card.saved ? 'saved' : ''}" onclick="toggleSave(${card.id})">🔖</span>
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleLike(id) {
    let card = cards.find(c => c.id === id);
    card.liked = !card.liked;
    renderCards();
}

function toggleSave(id) {
    let card = cards.find(c => c.id === id);
    card.saved = !card.saved;
    renderCards();
}

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelector(`.tab[onclick="switchTab('${tab}')"]`).classList.add("active");
    renderCards();
}

renderCards();