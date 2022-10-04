// initializes the app opject
const drinkApp = {};

// identifies form & dropdown items to track submission
const drinkChoice = document.getElementById('alcoholType');
const form = document.querySelector('form');
drinkApp.instructions = document.getElementById('drinkInstructions');
drinkApp.ingredients = document.getElementById('drinkIngredients');

// API URL and extensions used to find 
drinkApp.baseUrl = 'https://www.thecocktaildb.com/api/json/v1/1/';
drinkApp.findDrink = 'filter.php';
drinkApp.drinkDetails = 'lookup.php';
drinkApp.randomDrink = 'random.php';

// accepts an array, checks length, and returns a random number within range
function randNum(array) {
    const num = Math.floor(Math.random() * array.length);
    return num;
}

// function that uses URL & search to take user input (alcohol type) to return a random drink ID from list containing that alcohol, before passing to another function

drinkApp.selectDrink = () => {
    const url = new URL(drinkApp.baseUrl + drinkApp.findDrink);
    url.search = new URLSearchParams({
        i: drinkApp.drink
    })
    fetch(url)
        .then((promise) => {
            return promise.json()
        })
        .then((data) => {
            const recDrink = (data.drinks[randNum(data.drinks)].idDrink)
            drinkApp.getDrinkDetails(recDrink)
        })
        .catch((e) => {
            console.log("error: ", e)
        })
}

// function uses ID provided from grabData to obtain further information about drink (glass type, ingredients, instructions)
drinkApp.getDrinkDetails = (id) => {
    const url = new URL(drinkApp.baseUrl + drinkApp.drinkDetails);
    url.search = new URLSearchParams({
        i: id
    })
    fetch(url)
        .then((promise) => {
            return promise.json()
        })
        .then((data) => {
            console.log(`Obtained information for ${data.drinks[0].strDrink}`, data)
            drinkApp.recDrink = data.drinks[0];
            drinkApp.populateInstructions(drinkApp.recDrink.strInstructions);
            drinkApp.populateIngredients(drinkApp.recDrink);
        })
        .catch((e) => {
            console.log("error: ", e)
        })
}

// this inserts the instructions from the API into the HTML element
drinkApp.populateInstructions = (inst) => {
    // clears the innerHTML and opens an ordered list
    drinkApp.instructions.innerHTML = "<ol>";
    // checks for end of instructions to ensure there's a period to avoid missing the final instruction
   (inst[inst.length - 1] !== "." ? inst+="." : "")
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
        // checks to see if instructions uses numeric listing already, and removes the number and period
        else if (inst.indexOf(".").isInteger) {
            alert('catch');
        }
        // this catches elipses at the end of certain instructions
        else if (inst.indexOf(".") === 0) {
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
    drinkApp.instructions.innerHTML += "</ol>"
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

        // checks to see if the current ingredient exists, then inserts them into the table if they are
        if (drink[ingVar]) {
            drinkApp.ingredients.firstElementChild.innerHTML += `
            <tr>
                <td>${drink[ingVar]}</td>
                <td>${drink[ingMeasVar]}</td>
            </tr>
            `
        } 
        // if not, breaks the loop to avoid needless iterations
        else break;
    }
    // when for loop is complete, closes table
    drinkApp.ingredients.firstElementChild.innherHTML += "</tbody></table";
}

// app init creates form event listener for submission
drinkApp.init = () => {
    form.addEventListener('submit', function (e) {
        // prevents page reload
        e.preventDefault();
        // saves user choice from dropdown list
        drinkApp.drink = drinkChoice.value;
        console.log(drinkApp.drink);

        // checks to see if user has made a selection before making fetch request
        if (drinkApp.drink) {
            drinkApp.selectDrink();
        } else {
            alert('pick something');
        }
    })
}

// calls init method on page initialization
drinkApp.init();