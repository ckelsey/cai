const addText = methods => () => {
    const svg = methods.currentPageSvg()
    const svgBox = svg.getBoundingClientRect()
    const page = methods.currentPage()
    const elData = {
        id: `text_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`,
        parentId: methods.getIframeId(page.id),
        text: `replacement_variable`,
        tag: `text`,
        x: (svgBox.width / 2) - svgBox.left,
        y: (svgBox.height / 2) - svgBox.top,
        styles: {},
    }

    return methods.addItem(elData, page, svg)
}

export default addText