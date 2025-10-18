function sendChoice(choice) {
    switch(choice) {
        case 'dates':
            alert("Вы выбрали раздел: Даты");
            break;
        case 'terms':
            alert("Вы выбрали раздел: Термины");
            break;
        case 'events':
            alert("Вы выбрали раздел: События");
            break;
        case 'figures':
            alert("Вы выбрали раздел: Личности");
            break;
        default:
            alert("Выберите раздел!");
    }
}
