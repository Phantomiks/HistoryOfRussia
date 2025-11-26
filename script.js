function flip(card) {
    card.classList.toggle("flipped");
}

function toggleLike(e, el) {
    e.stopPropagation();
    el.classList.toggle("liked");
    el.classList.toggle("fa-solid");
}

function toggleSave(e, el) {
    e.stopPropagation();
    el.classList.toggle("saved");
    el.classList.toggle("fa-solid");
}