const AddImage = (state, url, w, h) => {
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
    const x = (((viewPort.width / 2) - viewPort.left) - (w / 2)) * scale
    const y = (((viewPort.height / 2) - top) - (h / 2)) * scale
    const elData = {
        id: `image_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`,
        parentId: state.renderer.pageContainerId(page.id),
        href: url,
        tag: `image`,
        x,
        y,
        w,
        h: `auto`,
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

export default AddImage