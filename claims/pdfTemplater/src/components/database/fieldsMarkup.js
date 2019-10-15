import CreateElement from '../../utils/html/create'
import CreateOptions from '../../utils/html/options'

const selectedOption = select => select.selectedOptions[0] ? select.selectedOptions[0].value : undefined

const renameFieldInput = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Rename` },
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

const defaultValueInput = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Default value` },
            parent: inputContainer
        })
        CreateElement({
            tag: `input`,
            attributes: { type: `text`, value: methods.defaultValue },
            parent: inputContainer,
            events: { input: input => { methods.defaultValue = input.value } }
        })
    }
})

const fieldSelect = (methods, parent) => CreateElement({
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
            parent: inputContainer,
            events: { input: select => methods.field = selectedOption(select) },
            run: select => {
                CreateOptions({
                    values: methods.root.sourceMetadata().keys,
                    value: methods.field,
                    parent: select
                })
            }
        })
    }
})

const proccessElement = (methods, parent) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            parent: inputContainer,
            run: label => {
                CreateElement({
                    tag: `span`,
                    attributes: { textContent: `Processes ` },
                    parent: label,
                    run: span => {
                        span.style.marginRight = `0.25rem`
                    }
                })
                CreateElement({
                    tag: `span`,
                    attributes: { textContent: `+`, className: `modifyBtn` },
                    parent: label,
                    events: { click: methods.newProcess },
                    run: btn => btn.style.marginLeft = `0.5rem`
                })
            }
        })

        CreateElement({
            tag: `div`,
            attributes: { className: `processContainer` },
            parent: inputContainer,
            run: processContainer => methods.processContainer = processContainer
        })
    }
})

const processSelect = (methods, parent, process) => CreateElement({
    parent,
    tag: `div`,
    attributes: { className: `inputContainer` },
    run: inputContainer => {
        CreateElement({
            tag: `label`,
            attributes: { textContent: `Method` },
            parent: inputContainer
        })
        CreateElement({
            tag: `select`,
            events: {
                input: select => {
                    const val = select.selectedOptions[0] ? select.selectedOptions[0].value : ``
                    methods.updateProcess(Object.assign({ id: process.id }, methods.newProcessMethod(val)))
                    const currentProcess = methods.processes[methods.getProcessIndex(process.id)]

                    Array.from(parent.querySelectorAll(`.processParam`)).forEach(param => param.parentElement.removeChild(param))
                    parent.removeChild(parent.querySelector(`.modifyBtn.danger`))

                    processParamsElement(methods, parent, currentProcess)
                    processDeleteBtn(methods, parent, currentProcess)
                }
            },
            parent: inputContainer,
            run: select => {
                CreateOptions({
                    values: methods.processMethods,
                    value: process.name,
                    parent: select
                })
            }
        })
    }
})

const processParamsElement = (methods, parent, process) => {
    let paramIndex = 0

    while (paramIndex < process.params.length) {
        const pIndex = paramIndex
        CreateElement({
            parent,
            tag: `div`,
            attributes: { className: `inputContainer processParam` },
            run: inputContainer => {
                CreateElement({
                    tag: `label`,
                    attributes: { textContent: process.params[pIndex].name },
                    parent: inputContainer
                })

                CreateElement({
                    tag: `input`,
                    attributes: { type: `text`, value: process.params[pIndex].value || `` },
                    parent: inputContainer,
                    events: {
                        input: input => {
                            process.params[pIndex].value = input.value
                            methods.save()
                        }
                    }
                })
            }
        })

        paramIndex = paramIndex + 1
    }
}

const processDeleteBtn = (methods, parent, process) => CreateElement({
    parent,
    tag: `span`,
    attributes: { textContent: `X`, className: `modifyBtn danger` },
    events: { click: () => methods.removeProcess(process.id) }
})

const renderProcess = (methods, process) => {
    return methods.processContainer.appendChild(
        CreateElement({
            tag: `div`,
            attributes: { className: `section`, id: process.id },
            run: container => {
                processSelect(methods, container, process)
                processParamsElement(methods, container, process)
                processDeleteBtn(methods, container, process)
            }
        })
    )
}

export const FieldsMarkup = methods => CreateElement({
    tag: `div`,
    attributes: { className: `outerSection box`, id: methods.id },
    run: wrapper => {
        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: wrapper,
            run: container => {
                fieldSelect(methods, container)
                renameFieldInput(methods, container)
                defaultValueInput(methods, container)

                CreateElement({
                    parent: container,
                    tag: `span`,
                    attributes: { textContent: `X`, className: `modifyBtn danger` },
                    events: { click: () => methods.root.removeProp(methods.id) },
                    run: btn => btn.style.marginLeft = `0.5rem`
                })
            }
        })

        CreateElement({
            tag: `div`,
            attributes: { className: `section` },
            parent: wrapper,
            run: container => {
                proccessElement(methods, container)
            }
        })
    }
})

export const RenderProcesses = (methods, p) => {
    if (!methods.processContainer) { return }
    methods.processContainer.innerHTML = ``
    p.forEach(process => renderProcess(methods, process))
}