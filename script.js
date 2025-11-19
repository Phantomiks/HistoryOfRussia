const BOT_USERNAME = "Hist0ry_of_Russia_bot";

function openBot() {
  if (!BOT_USERNAME) return;
  window.open("https://t.me/" + BOT_USERNAME, "_blank");
}

// Плавный скролл по якорям
document.addEventListener("click", e => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault();
    const id = e.target.getAttribute("href").substring(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
});
