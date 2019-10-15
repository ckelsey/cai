import CreateElement from '../../utils/html/create'
import CreateOptions from '../../utils/html/options'

const collectionSelect = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({ tag: `h3`, attributes: { textContent: `Collection` }, parent: inputContainer })
        CreateElement({
            tag: `select`,
            events: {
                input: select => methods.source = select.selectedOptions[0] ? select.selectedOptions[0].value : undefined
            },
            parent: inputContainer,
            run: _el => CreateOptions({
                empty: `Select source collection`,
                values: Object.keys(methods.dbMetadata()),
                value: methods.source,
                parent: _el
            })
        })
    }
})

const collectionName = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        inputContainer.style.alignSelf = `flex-end`
        CreateElement({ tag: `label`, attributes: { textContent: `Name` }, parent: inputContainer })
        CreateElement({
            tag: `input`,
            attributes: { placeholder: `name`, type: `text`, value: methods.name },
            events: { input: input => { methods.name = input.value } },
            parent: inputContainer,
        })
    }
})

const queryElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `modifyCollection` },
    run: el => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: el,
            run: _el => {
                CreateElement({ tag: `h3`, attributes: { textContent: `Query` }, parent: _el })
                CreateElement({
                    parent: _el,
                    tag: `span`,
                    attributes: { textContent: `+`, className: `modifyBtn` },
                    events: { click: methods.addQuery }
                })
            }
        })
        CreateElement({ tag: `div`, parent: el, run: _el => { methods.setQueryContainer(_el) } })
    }
})

const fieldElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `modifyCollection` },
    run: el => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: el,
            run: _el => {
                CreateElement({ tag: `h3`, attributes: { textContent: `Fields` }, parent: _el })
                CreateElement({
                    parent: _el,
                    tag: `span`,
                    attributes: { textContent: `+`, className: `modifyBtn` },
                    events: { click: methods.addField }
                })
            }
        })
        CreateElement({ tag: `div`, parent: el, run: _el => { methods.setFieldsContainer(_el) } })
    }
})

const customFieldElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `modifyCollection` },
    run: el => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: el,
            run: _el => {
                CreateElement({ tag: `h3`, attributes: { textContent: `Custom fields` }, parent: _el })
                CreateElement({
                    parent: _el,
                    tag: `span`,
                    attributes: { textContent: `+`, className: `modifyBtn` },
                    events: { click: methods.addCustomField }
                })
            }
        })
        CreateElement({ tag: `div`, parent: el, run: _el => { methods.setCustomFieldsContainer(_el) } })
    }
})

const joinElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `modifyCollection` },
    run: el => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: el,
            run: _el => {
                CreateElement({ tag: `h3`, attributes: { textContent: `Join collection` }, parent: _el })
                CreateElement({
                    parent: _el,
                    tag: `span`,
                    attributes: { textContent: `+`, className: `modifyBtn` },
                    events: { click: methods.addJoin }
                })
            }
        })

        CreateElement({ tag: `div`, parent: el, run: _el => { methods.setJoinContainer(_el) } })
    }
})

const removeBtn = (methods, root, parent) => CreateElement({
    parent,
    tag: `span`,
    attributes: { textContent: `X`, className: `modifyBtn danger` },
    events: { click: () => root.removeProp(methods.id) },
    run: btn => btn.style.marginLeft = `0.5rem`
})

const heading = (methods, root, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `section` },
    run: el => {
        collectionSelect(methods, el)

        if (!!root) {
            collectionName(methods, el)
            removeBtn(methods, root, el)
        }
    }
})

const expression = (methods, root, parent) => !!root ? undefined : CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `modifyCollection` },
    run: el => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: el,
            run: _el => {
                CreateElement({ tag: `h3`, attributes: { textContent: `Expression` }, parent: _el })
            }
        })

        CreateElement({ tag: `textarea`, parent: el, events: { input: input => methods.expression = input.value } })
        methods.setExpressionContainer(el)
    }
})

const SourceMarkup = (methods, root) => {
    const SourceEl = CreateElement({
        tag: `div`,
        attributes: { className: `dbSection`, id: methods.id },
        run: container => {
            heading(methods, root, container)
            queryElement(methods, container)
            fieldElement(methods, container)
            customFieldElement(methods, container)
            joinElement(methods, container)
            expression(methods, root, container)
        }
    })

    requestAnimationFrame(() => {
        [`queries`, `fields`, `customFields`, `joins`]
        .map(key => methods.subscribe(key, newVal => {
            const getElementCount = () => methods.getElements(key).length
            const insertNew = (item, index) =>
                methods.getContainer(key)
                .insertBefore(item.markup(), methods.getElements(key)[index])

            newVal.forEach((item, index) => {
                if (methods.getElements(key)[index]) {
                    if (methods.getElements(key)[index].id !== item.id) {
                        return insertNew(item, index)
                    }
                } else {
                    insertNew(item, index)
                }
            })

            while (getElementCount() > newVal.length) {
                const children = methods.getElements(key)
                const lastChild = children[children.length - 1]
                methods.getContainer(key).removeChild(lastChild)
            }
        }))
    })

    return SourceEl
}

export default SourceMarkup