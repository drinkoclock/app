// initializes the app opject
const drinkApp = {};

// identifies form & dropdown items to track submission
drinkApp.instructions = document.getElementById('drinkInstructions');
drinkApp.ingredients = document.getElementById('drinkIngredients');

// API URL and extensions used to find 
drinkApp.baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1/';
drinkApp.findDrink = 'filter.php';
drinkApp.drinkDetails = 'lookup.php';
drinkApp.randomDrink = 'random.php';

// accepts an array, checks length, and returns a random number within range
function randNum(array) {
    return Math.floor(Math.random() * array.length);
}

// when user selects from dropdown menu, will return a drink based on alcohol type and reset the field (avoids user selecting no value && allows user to choose the same alcohol type multiple times in a row)
drinkApp.select = function () {
    document.querySelector('#alcoholTypeBtn').addEventListener('click', function (e) {
         // prevents page reload
         e.preventDefault();
         // saves user choice from dropdown list
         const drink = document.querySelector('#alcoholType').value;
         // checks to see if user has made a selection before making fetch request
         if (drink) {
             drinkApp.selectDrink(drink);
         } else {
             alert('pick something');
         }
    })
}

// on button click, will prevent page refresh and return a random drink
drinkApp.random = function () {
    document.querySelector('#alcoholRandom').addEventListener('click', function (e) {
        e.preventDefault();
        drinkApp.selectDrink('random');
    })
}

// function that uses URL & search to take user input (alcohol type) to return a random drink ID from list containing that alcohol, before passing to another function (now also includes a check for random)
drinkApp.selectDrink = (alcType) => {
    if (alcType === "random") drinkApp.url = new URL(drinkApp.baseUrl + drinkApp.randomDrink);
    else {
        drinkApp.url = new URL(drinkApp.baseUrl + drinkApp.findDrink);
        drinkApp.url.search = new URLSearchParams({ i: alcType })
    }

    fetch(drinkApp.url)
        .then((promise) => promise.json())
        .then((data) => {
            drinkApp.getDrinkDetails(data.drinks[randNum(data.drinks)].idDrink)
        })
        .catch((e) => console.log("error: ", e))
}

// function uses ID provided from grabData to obtain further information about drink (glass type, ingredients, instructions)
drinkApp.getDrinkDetails = (id) => {
    const url = new URL(drinkApp.baseUrl + drinkApp.drinkDetails);
    url.search = new URLSearchParams({ i: id })
    fetch(url)
        .then((promise) => promise.json())
        .then((data) => {
            console.log(`Obtained information for ${data.drinks[0].strDrink}`, data)
            drinkApp.recDrink = data.drinks[0];
            drinkApp.populateInstructions(drinkApp.recDrink.strInstructions);
            drinkApp.populateIngredients(drinkApp.recDrink);
            document.querySelector('title').innerHTML = `Drink O'Clock - ${drinkApp.recDrink.strDrink}`
            console.log(data)
            return data;
        })
        .catch((e) => console.log("error: ", e))
}

// this inserts the instructions from the API into the HTML element
drinkApp.populateInstructions = (inst) => {
    // clears the innerHTML and opens an ordered list
    drinkApp.instructions.innerHTML = "<ol>";
    // checks for end of instructions to ensure there's a period to avoid missing the final instruction
    (inst[inst.length - 1] !== "." ? inst += "." : "")
    // will continue loop until all periods (end of sentences are removed)
    while (inst.indexOf('.') !== -1) {
        // this extracts the first four characters of the string
        const checkForStep = inst.slice(0, 4).toLowerCase()

        // series of checks to ensure proper formatting
        // first checks if the first four characters are 'step', if so, removes the first 6 characters (ie. step x)
        if (checkForStep === "step") {
            const restInst = inst.slice(6)
            inst = restInst.trim();
        }
        // checks to see if instructions uses numeric listing already (num = [0], '.' = [1]), and removes the number and period AS WELL AS checks for ellipses
        else if (inst.indexOf(".") === 0 || inst.indexOf(".") === 1) {
            const restInst = inst.slice(inst.indexOf(".") + 1)
            inst = restInst.trim();
        }
        // this outputs the instruction step
        else {
            const nextInst = inst.slice(0, (inst.indexOf(".") + 1))
            const restInst = inst.slice(inst.indexOf(".") + 1)
            inst = restInst.trim();
            drinkApp.instructions.firstElementChild.innerHTML += `
                <li>${nextInst}</li>
            `
        }
    }
    // closes the ordered list
    drinkApp.instructions.innerHTML += "</ol>";
}

// inserts ingredient list & measurements from API into the HTML element
drinkApp.populateIngredients = (drink) => {
    // clears ingredients element and inserts table
    drinkApp.ingredients.innerHTML = "<table><tbody>"
    // creates a for loop to go through a maximum possible 15 ingredients and list them
    for (i = 1; i < 16; i++) {
        // creates string literals to match the keys for both ingredients and measurements when searching
        const ingVar = `strIngredient${i}`;
        const ingMeasVar = `strMeasure${i}`;

        // checks to see if the current ingredient exists, then inserts them into the table if they are. There are instances of ingredients w/o measurements, so empty space is added instead of showing null
        if (drink[ingVar]) {
            drinkApp.ingredients.firstElementChild.innerHTML += `
            <tr>
                <td>${(!drink[ingMeasVar] ? '' : drink[ingMeasVar])}</td>
                <td>${drink[ingVar]}</td>                
            </tr>
            `
        }
        // if not, breaks the loop to avoid needless iterations
        else break;
    }
    // when for loop is complete, closes table
    drinkApp.ingredients.firstElementChild.innerHTML += "</tbody></table";
}

// app init creates form event listener for submission
drinkApp.init = () => {
    drinkApp.select();
    drinkApp.random();
}

// calls init method on page initialization
drinkApp.init();