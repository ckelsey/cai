const AddText = state => {
    const page = state.getCurrentPage()
    const pageContainer = document.getElementById(state.renderer.pageContainerId(page.id))
    const pageDoc = state.renderer.pageContainerDoc(pageContainer)
    const viewPort = pageContainer.getBoundingClientRect()
    const svg = pageDoc.getElementById(state.renderer.svgId(page.id))
    const svgBox = svg.getBoundingClientRect()
    const viewBox = svg.getAttribute(`viewBox`).split(` `)
    const svgHeight = parseFloat(viewBox[3])
    const scale = svgHeight / svgBox.height
    const top = viewPort.top - pageContainer.contentWindow.scrollY
    const elData = {
        id: `text_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`,
        parentId: state.renderer.pageContainerId(page.id),
        text: `replacement_variable`,
        tag: `text`,
        x: ((viewPort.width / 2) - viewPort.left) * scale,
        y: ((viewPort.height / 2) - top) * scale,
        styles: {},
    }

    // TODO - Calculate text width for center x/y. Currently anchored at top left corner, should be center

    state.getCurrentPage().addElement(elData)
    requestAnimationFrame(() => {
        const currentPage = state.getCurrentPage()
        const addedElementData = currentPage.elements[elData.id]
        state.renderer.renderPageElement(addedElementData, currentPage)
    })
}

export default AddText