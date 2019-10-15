const addImage = methods => (url, w = `auto`, h = `auto`) => {
    if (!url) { return }

    const svg = methods.currentPageSvg()
    const svgBox = svg.getBoundingClientRect()
    const page = methods.currentPage()
    const elData = {
        id: `image_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`,
        parentId: methods.getIframeId(page.id),
        href: url,
        tag: `image`,
        x: (svgBox.width / 2) - svgBox.left,
        y: (svgBox.height / 2) - svgBox.top,
        styles: {},
        w,
        h,
    }

    return methods.addItem(elData, page, svg)
}

export default addImage