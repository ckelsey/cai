const renderPages = (methods, pageElements) => pages => {
    pageElements.editorContainer.innerHTML = ``
    if (!pages) { return }

    return Promise.all(pages.map(page => methods.renderPage(page)))
        .then(() => {
            methods.setActivePageElement()
            methods.applyGlobalStyles()
        })
}

export default renderPages