function CreateElement(elementData) {
    const el = document.createElement(elementData.tag)

    if (elementData.attributes) {
        Object.keys(elementData.attributes).forEach(attr => {
            el[attr] = elementData.attributes[attr]
        })
    }

    if (elementData.events) {
        Object.keys(elementData.events).forEach(evt => {
            el.addEventListener(evt, (e) => {
                elementData.events[evt](el, e)
            })
        })
    }

    if (elementData.parent && typeof elementData.parent.appendChild === `function`) { elementData.parent.appendChild(el) }
    if (elementData.run) { elementData.run(el) }

    return el
}

export default CreateElement