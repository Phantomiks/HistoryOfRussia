function sendChoice(choice) {
    if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(choice); // отправка данных боту
    } else {
        alert("Вы выбрали: " + choice); // тест в браузере
    }
}