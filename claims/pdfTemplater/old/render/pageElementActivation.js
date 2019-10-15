const pageElementActivation = (methods, state) => el => {
    state.pages
        .forEach(
            page => Object.keys(page.elements)
            .forEach(key => {
                const thisEl = methods.elementNode(page.elements[key])
                if (thisEl === el) {
                    thisEl.classList.add(`active`)
                } else {
                    thisEl.classList.remove(`active`)
                }
            })
        )
}

export default pageElementActivation