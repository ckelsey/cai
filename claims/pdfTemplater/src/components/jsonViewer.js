import CreateElement from "../utils/html/create";

const DATE_STRING_REGEX = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/
const PARTIAL_DATE_REGEX = /\d{2}:\d{2}:\d{2} GMT-\d{4}/
const JSON_DATE_REGEX = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

const TypeOf = item => {
    let type = undefined

    switch (typeof item) {
        case `object`:
            type = Array.isArray(item) ? `array` : item instanceof Date ? `date` : `object`
            break
        default:
            type = typeof item
            break;
    }

    return type
}

const JsonViewer = (data, name) => {
    const dataType = TypeOf(data)
    const expandable = [`array`, `object`].indexOf(dataType) > -1
    let className = `json-row type-${dataType}`

    switch (dataType) {
        case `array`:

            break;

        default:
            break;
    }

    return CreateElement({
        tag: `div`,
        attributes: { className },
        run: wrapper => {
            let childWrapper
            const expand = () => {
                if (!childWrapper) { return }

                childWrapper.innerHTML = ``

                if (wrapper.classList.contains(`open`)) {
                    if (dataType === `object`) {
                        Object.keys(data).sort().forEach(itemKey => {
                            childWrapper.appendChild(JsonViewer(data[itemKey], itemKey))
                        })
                    } else {
                        data.forEach((item, itemKey) => {
                            childWrapper.appendChild(JsonViewer(item, itemKey))
                        })
                    }
                }
            }

            CreateElement({
                parent: wrapper,
                tag: `div`,
                attributes: { className: `json-toggler` },
                events: {
                    click: () => {
                        if (expandable) {
                            wrapper.classList.toggle(`open`)
                            expand()
                        }
                    }
                },
                run: parent => {
                    CreateElement({
                        parent,
                        tag: `div`,
                        attributes: {
                            className: `json-key-name`,
                            textContent: name || `${dataType.charAt(0).toUpperCase()}${dataType.slice(1)}`
                        }
                    })
                    CreateElement({
                        parent,
                        tag: `div`,
                        attributes: {
                            className: `json-colon`,
                            textContent: `:`
                        },
                    })
                    CreateElement({
                        parent,
                        tag: `div`,
                        attributes: {
                            className: `json-value`,
                            textContent: expandable ? `` : `${data}`
                        }
                    })
                },
            })

            if (expandable) {
                childWrapper = CreateElement({
                    parent: wrapper,
                    tag: `div`,
                    attributes: { className: `json-children` }
                })
            }
        }
    })
}

export default JsonViewer