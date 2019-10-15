import CreateElement from '../../utils/html/create'
import CreateOptions from '../../utils/html/options'
import Get from '../../utils/get'

const selectedOption = select => select.selectedOptions[0] ? select.selectedOptions[0].value : undefined

const operatorElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Operator` },
            parent: inputContainer
        })
        CreateElement({
            tag: `select`,
            events: { input: select => methods.operator = selectedOption(select) },
            parent: inputContainer,
            run: _el => {
                CreateOptions({
                    values: methods.operators,
                    value: methods.operator,
                    parent: _el
                })
            }
        })
    }
})

const fieldElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Field` },
            parent: inputContainer
        })

        CreateElement({
            tag: `select`,
            events: { input: select => methods.field = selectedOption(select) },
            parent: inputContainer,
            run: _el => {
                CreateOptions({
                    values: methods.sourceMeta.keys,
                    value: methods.field,
                    parent: _el
                })
            }
        })
    }
})

const valueTypeElement = (methods, root, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        const _types = methods.types.slice()
        const path = root.getPath(methods.id)

        if (path && path.indexOf(`joins`) > -1) {
            const parentSources = []
            const pathBits = path.split(`.`).slice(0, -3)

            pathBits.forEach((bit, index) => {
                let len = index
                let p = bit
                while (len--) { p = `${pathBits[len]}.${p}` }

                const obj = Get(root.getSources(), p)

                if (obj && obj.id && obj.id.indexOf(`source`) === 0) {
                    parentSources.push(obj.source)
                }
            })

            parentSources.forEach(parent => _types.push(`${parent} field`))
        }

        CreateElement({
            tag: `label`,
            attributes: { textContent: `Value Type` },
            parent: inputContainer
        })

        CreateElement({
            tag: `select`,
            events: { input: select => { methods.type = selectedOption(select) } },
            parent: inputContainer,
            run: _el => {
                CreateOptions({
                    values: _types,
                    value: methods.type,
                    parent: _el
                })
            }
        })
    }
})

export const ValueElement = (methods, root) => CreateElement({
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Value` },
            parent: inputContainer
        })

        if (methods.type.indexOf(` field`) > -1) {
            CreateElement({
                tag: `select`,
                events: { input: select => methods.value = selectedOption(select) ? `{{${methods.type.split(' ')[0]}.${selectedOption(select)}}}` : undefined },
                parent: inputContainer,
                run: select => {
                    CreateOptions({
                        values: root.dbMetadata()[methods.type.split(` `)[0]].keys,
                        value: methods.value,
                        parent: select
                    })
                }
            })
        } else {
            CreateElement({
                tag: `input`,
                attributes: { value: methods.value },
                events: { input: input => methods.value = input.value },
                parent: inputContainer
            })
        }
    }
})

export const QueryMarkup = (methods, root) => {
    return CreateElement({
        tag: `div`,
        attributes: { className: `box`, id: methods.id },
        run: box => {
            CreateElement({
                parent: box,
                tag: `div`,
                attributes: { className: `section zebra` },
                run: container => {
                    fieldElement(methods, container)
                    operatorElement(methods, container)
                    valueTypeElement(methods, root, container)
                    methods.valueField = ValueElement(methods, root)
                    container.appendChild(methods.valueField)

                    CreateElement({
                        parent: container,
                        tag: `span`,
                        attributes: { textContent: `X`, className: `modifyBtn danger` },
                        events: { click: () => root.removeProp(methods.id) },
                        run: btn => btn.style.marginLeft = `0.5rem`
                    })
                }
            })
        }
    })
}