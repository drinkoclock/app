const drinkApp = {};

const drinkChoice = document.getElementById('alcoholType');
const form = document.querySelector('form');

drinkApp.URL = 'https://www.thecocktaildb.com/api/json/v1/1/';
drinkApp.findDrink = 'filter.php'
drinkApp.drinkDetails = 'lookup.php'

function randNum(array) {
    const num = Math.floor(Math.random() * array.drinks.length);
    return num;
}

drinkApp.grabData = () => {
    const appURL = new URL(`${drinkApp.URL}${drinkApp.findDrink}`);
    appURL.search = new URLSearchParams({
        i: drinkApp.drink
    })
    fetch(appURL)
        .then((promise) => {
            return promise.json()
        })
        .then((data) => {
            const recDrink = (data.drinks[randNum(data)].idDrink)
            console.log(recDrink)
            drinkApp.grabDetails(recDrink)
        })
}

drinkApp.grabDetails = (id) => {
    const appURL = new URL(`${drinkApp.URL}${drinkApp.drinkDetails}`);
    appURL.search = new URLSearchParams({
        i: id
    })
    fetch(appURL)
    .then((promise) => {
        return promise.json()
    })
    .then((data) => {
        console.log(data)
    })
}

drinkApp.init = () => {
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        drinkApp.drink = drinkChoice.value;
        drinkApp.grabData();
    })

}

drinkApp.init();