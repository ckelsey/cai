const updateStyleInputs = (methods, state, pageElements) => () => {
    const applyValue = (i, v, k) => {
        if (k !== `fontFamily`) {
            v = methods.styleToVal(v, k)
            if (v === undefined || isNaN(v)) { return }
            i.value = v
        } else {
            Array.from(i.querySelectorAll(`option`)).forEach(option => {
                if (option.value === v) {
                    option.setAttribute(`selected`, true)
                } else {
                    option.removeAttribute(`selected`)
                }
            })
        }
    }

    Object.keys(pageElements.globalStyleInputs).forEach(
        inputKey => applyValue(
            pageElements.globalStyleInputs[inputKey],
            state.styles[inputKey],
            inputKey
        )
    )

    if (!methods.currentElement) { return }

    Object.keys(pageElements.elementStyleInputs).forEach(
        inputKey => applyValue(
            pageElements.elementStyleInputs[inputKey],
            methods.elementData(methods.currentElement).styles[inputKey],
            inputKey
        )
    )
}

export default updateStyleInputs