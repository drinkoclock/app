const defaultVal = "true";
// initializes the app object
const drinkApp = {
    // identifies form & dropdown items to track submission
    instructions: document.querySelector('#drinkInstructions'),
    ingredients: document.querySelector('#drinkIngredients'),
    backContainer: document.querySelector('.takeMeBackContainer'),
    formSlide: document.querySelector('#formSlide'),
    drinkSlide: document.querySelector('#drinkSlide'),
    drinkImage: document.querySelector('#drinkImage'),
    loader: document.querySelector('#loaderContainer'),
    // API URL and extensions used to find 
    baseUrl: 'https://www.thecocktaildb.com/api/json/v1/1/',
    findDrink: 'filter.php',
    drinkDetails: 'lookup.php',
    randomDrink: 'random.php',

    // function that uses URL & search to take user input (alcohol type) to return a random drink ID from list containing that alcohol, before passing to another function (now also includes a check for random)
    selectDrink: async (alcType) => {
        try {
            if (alcType === "random") drinkApp.url = new URL(drinkApp.baseUrl + drinkApp.randomDrink);
            else {
                drinkApp.url = new URL(drinkApp.baseUrl + drinkApp.findDrink);
                drinkApp.url.search = new URLSearchParams({ i: alcType })
            }
            // will keep running until it returns a drink with English instructions (not all drinks in the API have English instructions)
            while (1 > 0) {
                const id = await fetch(drinkApp.url)
                    .then((promise) => promise.json())
                    .then((data) => data.drinks[randNum(data.drinks)].idDrink)

                // next call obtains further information about drink (glass type, ingredients, instructions)
                const url = new URL(drinkApp.baseUrl + drinkApp.drinkDetails);
                url.search = new URLSearchParams({ i: id })
                const response = await fetch(url)
                    .then((promise) => promise.json())
                    .then((data) => data.drinks[0])
                console.log(response);
                if (response.strInstructions) {
                    drinkApp.populateInstructions(response.strInstructions);
                    drinkApp.populateIngredients(response);
                    drinkApp.populateGlass(response.strGlass);
                    drinkApp.toggleActive(true);
                    drinkApp.drinkImage.innerHTML = `<img src="${response.strDrinkThumb}" alt="${response.strDrink}" >`;
                    document.querySelector('#drinkHeader').innerHTML = `<h2>${response.strDrink}</h2>`
                    document.querySelector('title').innerHTML = `Drink O'Clock - ${response.strDrink}`
                    break;
                }
            }
        } catch (e) {
            console.error(e);
        }
    },
    // when user selects from dropdown menu, will return a drink based on alcohol type and reset the field (avoids user selecting no value && allows user to choose the same alcohol type multiple times in a row)
    select: () => {
        document.querySelector('#alcoholTypeBtn').addEventListener('click', function (e) {
            // prevents page reload
            e.preventDefault();
            // saves user choice from dropdown list
            const drink = document.querySelector('#alcoholType').value;
            // checks to see if user has made a selection before making fetch request
            (drink ? drinkApp.selectDrink(drink) : alert('Please select an alcohol type'))
        })
    },
    // toggles classes on / off depending on state 
    toggleActive: (isNewDrink) => {
        drinkApp.formSlide.classList.toggle('inactiveForm');
        // only calls loading animation when it's a new drink request, otherwise instantaneous
        if (isNewDrink) {
            drinkApp.loading();
            setTimeout(function() {drinkApp.drinkSlide.classList.toggle('inactiveDrink')}, 1000);
        } else {
            drinkApp.drinkSlide.classList.toggle('inactiveDrink');
        }
        
    },
    // on button click, will prevent page refresh and return a random drink
    random: () => {
        document.querySelector('#alcoholRandom').addEventListener('click', function (e) {
            e.preventDefault();
            drinkApp.selectDrink('random');
        })
    },
    // button that slides menu back and drink out to make a new selection
    drinkAgain: () => {
        document.querySelector('#drinkAgainBtn').addEventListener('click', function () {
            drinkApp.backContainer.classList.remove('hidden');
            drinkApp.toggleActive();
        })
    },
    // button that shows up only after a drink has been returned, allowing user to return to drink if they change their mind about grabbing a new drink
    takeMeBack: () => {
        document.querySelector('#takeMeBack').addEventListener('click', function (e) {
            e.preventDefault();
            drinkApp.toggleActive();
        })
    },
    // creates a delay to set up a loading animation when requesting new drink data
    loading: () => {
        drinkApp.loader.classList.toggle('isNotLoading');
        setTimeout(function () { drinkApp.loader.classList.toggle('isNotLoading') }, 1000)
    },
    // will display drink glass type, uses regex to remove special characters & whitespace to match corresponding svg file
    populateGlass: (glass) => {
        document.querySelector('#drinkGlass').innerHTML = `
            <img src='./assets/${glass.replace(/[.*+?^${}()|/[\]\\\s]/g, '')}.svg' >
            <p>${glass}</p>
        `;
    },
    // this inserts the instructions from the API into the HTML element
    populateInstructions: (inst) => {
        // clears the innerHTML and opens an ordered list
        drinkApp.instructions.innerHTML = "<h3>Instructions</h3><ol id='instList '>";
        // checks for end of instructions to ensure there's a period to avoid missing the final instruction
        (inst[inst.length - 1] !== "." ? inst += "." : "")
        // will continue loop until all periods (end of sentences are removed)
        while (inst.indexOf('.') !== -1) {
            // this extracts specific characters of the string to check for issues
            const checkForOz = inst.slice(inst.indexOf('.') - 2, inst.indexOf('.')).toLowerCase()
            // checks to see if instructions uses numeric listing already (num = [0], '.' = [1])
            if (parseInt(inst[0])) inst = inst.slice(2).trim();
            // series of checks to ensure proper formatting
            // first checks if the first four characters are 'step', if so, removes the first 6 characters (ie. step x)
            if (inst.slice(0, 4).toLowerCase() === "step") {
                inst = inst.slice(6).trim();
            }
            // this removes the period from the end of 'oz.' to avoid incorrect formatting
            else if (checkForOz === "oz") {
                inst = inst.slice(0, inst.indexOf('.')) + inst.slice(inst.indexOf('.') + 1);
            }
            // removes the number and period AS WELL AS checks for ellipses
            else if (inst.indexOf(".") === 0) {
                inst = inst.slice(inst.indexOf(".") + 1).trim();
            }
            // this outputs the instruction step
            else {
                const nextInst = inst[0].toUpperCase() + inst.slice(1, (inst.indexOf(".")))
                inst = inst.trim().slice(inst.indexOf(".") + 1).trim();
                drinkApp.instructions.lastElementChild.innerHTML += `
                <li class="themed list ${darkMode.state === 'true' ? 'darkModeList' : 'lightModeList'}">${nextInst}</li>
            `
            }
        }
        // closes the ordered list
        drinkApp.instructions.innerHTML += "</ol>";
    },
    // inserts ingredient list & measurements from API into the HTML element
    populateIngredients: (drink) => {
        // clears ingredients element
        drinkApp.ingredients.innerHTML = "<h3>Ingredients</h3><div id='ingList'>"
        // creates a for loop to go through a maximum possible 15 ingredients and list them
        for (i = 1; i < 16; i++) {
            // creates string literals to match the keys for both ingredients and measurements when searching
            const ingVar = `strIngredient${i}`;
            const ingMeasVar = `strMeasure${i}`;

            // checks to see if the current ingredient exists, then inserts them into the table if they are. There are instances of ingredients w/o measurements, so empty space is added instead of showing null
            if (drink[ingVar]) {
                document.querySelector('#ingList').innerHTML += `
            <div class="infoContainer">
                <div class="measurementContainer themed text ${(darkMode.state === "true" ? 'darkModeText' : 'lightModeText')}">${(!drink[ingMeasVar] ? '' : drink[ingMeasVar])}</div>
                <div class="ingredientContainer">${drink[ingVar]}</div>                
            </div>
            `
            }
            // if not, breaks the loop to avoid needless iterations
            else break;
        }
        // when for loop is complete
        drinkApp.ingredients.innerHTML += "</div";
    },
    // app init creates form event listener for submission
    init: () => {
        drinkApp.select();
        drinkApp.random();
        drinkApp.drinkAgain();
        drinkApp.takeMeBack();
    }
};

const darkMode = {
    // toggle function checks for all themed components and toggles class between dark mode and light mode
    toggle: (btnClicked) => {
        const themedElements = document.querySelectorAll('.themed');
        themedElements.forEach((item) => {
            if (item.classList.contains('content')) {
                item.classList.toggle('darkModeContent');
                item.classList.toggle('lightModeContent');
            } else if (item.classList.contains('text')) {
                item.classList.toggle('darkModeText');
                item.classList.toggle('lightModeText');
            } else if (item.classList.contains('list')) {
                item.classList.toggle('darkModeList');
                item.classList.toggle('lightModeList');
            } else {
                item.classList.toggle('darkMode');
                item.classList.toggle('lightMode');
            }
        })
        if (btnClicked) {
            (darkMode.state === "true" ? darkMode.state = "false" : darkMode.state = "true");
            (btnClicked ? window.localStorage.setItem('isDarkMode', JSON.stringify(darkMode.state)) : '')
        }
    },
    // checks if user left off in light or dark mode
    isActive: () => {
        let val;
        try {
            console.log('checking')
            val = JSON.parse(window.localStorage.getItem('isDarkMode') || String(defaultVal));
        } catch (e) {
            console.log(e);
            val = defaultVal;
        }
        return val;
    },
    // initializes the slider button
    button: () => {
        document.querySelector(".darkModeSlider").addEventListener('click', function () {
            darkMode.toggle(true);
        })
    },

    init: () => {
        darkMode.state = darkMode.isActive();
        // if user left off in light mode will toggle colours to to light mode
        (darkMode.state === "false" ? darkMode.toggle(false) : '');
        // sets the checkbox to checked if darkMode is active
        (darkMode.state === "true" ? document.querySelector('#checkbox').checked = true : '');
        darkMode.button();
    }
}
// accepts an array, checks length, and returns a random number within range
function randNum(array) {
    return Math.floor(Math.random() * array.length);
}

// calls init method on page initialization
drinkApp.init();
darkMode.init();