const setActivePageElement = (state, pageElements) => (currentPage = state.currentPage) =>
    Array.from(
        pageElements.editorContainer.querySelectorAll(`.page_container`)
    )
    .forEach(
        (el, index) => index + 1 === currentPage ?
        el.classList.add(`active`) :
        el.classList.remove(`active`)
    )

export default setActivePageElement