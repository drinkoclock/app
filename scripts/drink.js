const drink = {
    instructions: document.getElementById('drinkInstructions'),
    ingredients: document.getElementById('drinkIngredients'),
    drinkSlide: document.querySelector('#drinkSlide'),
    drinkImage: document.querySelector('#drinkImage'),
    drinkGlass: document.querySelector('#drinkGlass'),

    baseUrl: 'https://www.thecocktaildb.com/api/json/v1/1/lookup.php',

    // searches url for id param and returns it for drink page
    grabId: () => {
        let params = (new URL(document.location)).searchParams;
        return params.get("id");
    },

    populateDrink: async () => {
        const id = drink.grabId();
        const url = new URL(drink.baseUrl);
        url.search = new URLSearchParams({ i: id })
        try {
            const response = await fetch(url)
                .then((promise) => promise.json())
                .then((data) => data.drinks[0])
            if (response.strInstructions) {
                drink.populateInstructions(response.strInstructions);
                drink.populateIngredients(response);
                drink.populateGlass(response.strGlass);
                drink.drinkImage.innerHTML = `<img src="${response.strDrinkThumb}" alt="${response.strDrink}" >`;
                drink.drinkGlass.lastElementChild.innerHTML = `${response.strGlass}`;
                document.querySelector('#drinkHeader').innerHTML = `<h2>${response.strDrink}</h2>`
                document.querySelector('title').innerHTML = `Drink O'Clock - ${response.strDrink}`
            }
        } catch (e) {
            console.log(e);
        }
    },
    // will display drink glass type, uses regex to remove special characters & whitespace to match corresponding svg file
    populateGlass: (glass) => {
        document.querySelector('#drinkGlass').innerHTML = `
                <img src='./assets/${glass.replace(/[.*+?^${}()|/[\]\\\s]/g, '')}.svg' >
                <p>${glass}</p>
            `;
    },
    populateInstructions: (inst) => {
        // clears the innerHTML and opens an ordered list
        drink.instructions.innerHTML = "<h3>Instructions</h3><ol id='instList '>";
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
                drink.instructions.lastElementChild.innerHTML += `
                <li class="themed list ${darkMode.state === 'true' ? 'darkModeList' : 'lightModeList'}">${nextInst}</li>
            `
            }
        }
        // closes the ordered list
        drink.instructions.innerHTML += "</ol>";
    },
    // inserts ingredient list & measurements from API into the HTML element
    populateIngredients: (ing) => {
        // clears ingredients element
        drink.ingredients.innerHTML = "<h3>Ingredients</h3><div id='ingList'>"
        // creates a for loop to go through a maximum possible 15 ingredients and list them
        for (i = 1; i < 16; i++) {
            // creates string literals to match the keys for both ingredients and measurements when searching
            const ingVar = `strIngredient${i}`;
            const ingMeasVar = `strMeasure${i}`;
            // checks to see if the current ingredient exists, then inserts them into the table if they are. There are instances of ingredients w/o measurements, so empty space is added instead of showing null
            if (ing[ingVar]) {
                document.querySelector('#ingList').innerHTML += `
            <div class="infoContainer">
                <div class="measurementContainer themed text ${(darkMode.state === "true" ? 'darkModeText' : 'lightModeText')}">${(!ing[ingMeasVar] ? '' : ing[ingMeasVar])}</div>
                <div class="ingredientContainer">${ing[ingVar]}</div>                
            </div>
            `
            }
            // if not, breaks the loop to avoid needless iterations
            else break;
        }
        // when for loop is complete
        drink.ingredients.innerHTML += "</div";
    },
    // button redirects to main page so user can select another drink
    chooseAnother: () => {
        document.querySelector('#drinkAgainBtn').addEventListener('click', function(e) {
            e.preventDefault();
            const end = window.location.href.indexOf('?');
            url = window.location.href.slice(0, end);
            newUrl = url.replace('drink', 'index');
            window.location.href = newUrl;
        })
    },
    init: () => {
        drink.chooseAnother();
    }
}

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
// searches the web address and obtains id search param
drink.init();
darkMode.init();
drink.populateDrink();