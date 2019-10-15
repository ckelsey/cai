import CreateElement from '../../utils/html/create'
import Subject from '../../utils/observe/subject'
import ID from '../../utils/id'
import Get from '../../utils/get'

const CustomFieldsElement = (root, dataToLoad) => {
    const properties = {
        name: new Subject(Get(dataToLoad, `name`, ``)),
        value: new Subject(Get(dataToLoad, `value`, ``)),
    }

    const getProp = (key) => properties[key].value
    const setProp = (key, v) => v === properties[key].value ? undefined : properties[key].next(v)

    let methods = {
        id: ID(`customfield`),
        get name() { return getProp(`name`) },
        set name(v) { setProp(`name`, v) },
        get value() { return getProp(`value`) },
        set value(v) { setProp(`value`, v) },

        data() {
            return {
                name: methods.name,
                value: methods.value,
            }
        },

        markup() {
            return CreateElement({
                tag: `div`,
                attributes: { className: `outerSection box`, id: methods.id },
                run: wrapper => {
                    CreateElement({
                        tag: `div`,
                        attributes: { className: `section` },
                        parent: wrapper,
                        run: container => {
                            nameFieldInput(container)
                            valueInput(container)

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
    }

    const nameFieldInput = parent => CreateElement({
        parent,
        tag: `div`,
        attributes: { className: `inputContainer` },
        run: inputContainer => {
            CreateElement({
                tag: `label`,
                attributes: { textContent: `Name` },
                parent: inputContainer
            })
            CreateElement({
                tag: `input`,
                attributes: { type: `text`, value: methods.name },
                parent: inputContainer,
                events: { input: input => { methods.name = input.value } }
            })
        }
    })

    const valueInput = parent => CreateElement({
        parent,
        tag: `div`,
        attributes: { className: `inputContainer` },
        run: inputContainer => {
            CreateElement({
                tag: `label`,
                attributes: { textContent: `Value` },
                parent: inputContainer
            })
            CreateElement({
                tag: `input`,
                attributes: { type: `text`, value: methods.value },
                parent: inputContainer,
                events: { input: input => { methods.value = input.value } }
            })
        }
    })

    Object.keys(properties).forEach(key => { properties[key].subscribe(root.save) })

    return methods
}

export default CustomFieldsElement