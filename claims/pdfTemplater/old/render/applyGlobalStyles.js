const applyGlobalStyles = (methods, state) => () => {
    state.pages.forEach(page => {
        Object.keys(page.elements).forEach(key => {
            methods.elementNode(page.elements[key])
            const el = methods.elementNode(page.elements[key])
            const styles = page.elements[key].styles || {}

            Object.keys(state.styles).forEach(styleKey => {
                if (!styles[styleKey]) {
                    let val = state.styles[styleKey]
                    el.style[methods.styleKeyToCss(styleKey)] = val
                }
            })
        })
    })
}

export default applyGlobalStyles