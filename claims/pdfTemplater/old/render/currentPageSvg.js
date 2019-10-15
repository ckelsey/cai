const currentPageSvg = methods => () => {
    const page = methods.currentPage()
    return methods.getIframeDoc(
            document.getElementById(
                methods.getIframeId(page.id)
            )
        )
        .getElementById(
            methods.getSvgId(page.id)
        )
}

export default currentPageSvg