const applyElementStyles = (methods, state) => item => {
    const el = methods.elementNode(item)
    Object.keys(state.styles).forEach(
        styleKey => el.style[methods.styleKeyToCss(styleKey)] = item.styles[styleKey] || state.styles[styleKey]
    )
}

export default applyElementStyles