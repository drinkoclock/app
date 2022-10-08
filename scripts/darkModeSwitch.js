const defaultVal = "true";
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
        (darkMode.state === "false" ? darkMode.toggle(false) : '')
        darkMode.button();
    }
}

darkMode.init();