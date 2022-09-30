// initializes the app opject
const drinkApp = {};

// identifies form & dropdown items to track submission
const drinkChoice = document.getElementById('alcoholType');
const form = document.querySelector('form');

// API URL and extensions used to find 
drinkApp.URL = 'https://www.thecocktaildb.com/api/json/v1/1/';
drinkApp.findDrink = 'filter.php'
drinkApp.drinkDetails = 'lookup.php'

// accepts an array, checks length, and returns a random number within range
function randNum(array) {
    const num = Math.floor(Math.random() * array.length);
    return num;
}

// function that uses URL & search to take user input (alcohol type) to return a random drink ID from list containing that alcohol, before passing to another function
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
            const recDrink = (data.drinks[randNum(data.drinks)].idDrink)
            console.log(recDrink)
            drinkApp.grabDetails(recDrink)
        })
}

// function uses ID provided from grabData to obtain further information about drink (glass type, ingredients, instructions)
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
        console.log(`Obtained information for ${data.drinks[0].strDrink}`)
        console.log(data)
    })
}

// app init creates form event listener for submission
drinkApp.init = () => {
    form.addEventListener('submit', function (e) {
        // prevents page reload
        e.preventDefault();
        // saves user choice from dropdown list
        drinkApp.drink = drinkChoice.value;
        // calls function to grab information regarding drink
        drinkApp.grabData();
    })
}

// calls init method on page initialization
drinkApp.init();