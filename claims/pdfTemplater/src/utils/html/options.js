import CreateElement from './create'

function CreateOptions(optionsData) {
    if (!optionsData.parent || typeof optionsData.parent.appendChild !== `function`) { return }
    if (optionsData.empty) {
        optionsData.parent.appendChild(CreateElement({
            tag: `option`,
            attributes: { textContent: optionsData.empty, value: `` }
        }))
    }

    optionsData.values.forEach(option => {
        const selected = optionsData.value === option
        const attributes = {
            textContent: option,
            value: option,
            selected
        }

        if (!!selected) { attributes.selected = selected }

        optionsData.parent.appendChild(CreateElement({
            tag: `option`,
            attributes
        }))
    })
}

export default CreateOptions