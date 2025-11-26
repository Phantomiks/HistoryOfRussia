const data = [
    { date: "12.03.1945", text: "В этот день произошло важное историческое событие." },
    { date: "25.09.2001", text: "Что-то интересное и запоминающееся случилось." },
    { date: "01.01.1990", text: "Описание того, что было в этот день." }
];

const feed = document.getElementById("feed");

function loadLikes() {
    return JSON.parse(localStorage.getItem("likes") || "{}");
}
function loadBookmarks() {
    return JSON.parse(localStorage.getItem("bookmarks") || "{}");
}

let likes = loadLikes();
let bookmarks = loadBookmarks();

data.forEach((item, i) => {
    const page = document.createElement("div");
    page.className = "page";
    page.innerHTML = `
        <div class="card" data-id="${i}">
            <div class="card-title">${item.date}</div>

            <div class="card-content">${item.text}</div>

            <div class="actions">
                <div class="action-btn like ${likes[i] ? "active" : ""}">❤️</div>
                <div class="action-btn bookmark ${bookmarks[i] ? "active" : ""}">🔖</div>
            </div>
        </div>
    `;
    feed.appendChild(page);
});

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", (e) => {
        if (e.target.classList.contains("action-btn")) return;

        card.classList.toggle("expanded");
    });
});

document.querySelectorAll(".like").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const id = e.target.parentElement.parentElement.dataset.id;
        likes[id] = !likes[id];
        localStorage.setItem("likes", JSON.stringify(likes));
        e.target.classList.toggle("active");
    });
});

document.querySelectorAll(".bookmark").forEach(btn => {
    btn.addEventListener("click", (e) => {
        const id = e.target.parentElement.parentElement.dataset.id;
        bookmarks[id] = !bookmarks[id];
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        e.target.classList.toggle("active");
    });
});