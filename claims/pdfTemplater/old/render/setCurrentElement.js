const setCurrentElement = (methods, pageElements) => el => {
    methods.currentElement = el

    if (!el) {
        pageElements.textInput.value = ``
        methods.updateStyleInputs()
            // elementsToHideIfNoCurrentElement.forEach(el => el.classList.add(`disabled`))
        return
    }

    pageElements.textInput.value = el.textContent
    methods.updateStyleInputs()
        // elementsToHideIfNoCurrentElement.forEach(el => el.classList.add(`disabled`))
}

export default setCurrentElement