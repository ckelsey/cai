import Subject from '../../utils/observe/subject'
import ID from '../../utils/id'
import { FieldsMarkup, RenderProcesses } from './fieldsMarkup'
import Get from '../../utils/get'

const FieldsElement = (root, dataToLoad) => {
    const processParams = {
        split: [{
            name: `delimiter`,
            type: `string`,
            value: ``
        }],
        join: [{
            name: `glue`,
            type: `string`,
            value: ``
        }],
        slice: [{
            name: `start`,
            type: `number`,
            value: 0
        }, {
            name: `end`,
            type: `number`,
            value: ``
        }],
    }

    const properties = {
        field: new Subject(Get(dataToLoad, `field`, root.sourceMetadata().keys[0])),
        name: new Subject(Get(dataToLoad, `name`, ``)),
        processes: new Subject([]),
        defaultValue: new Subject(Get(dataToLoad, `defaultValue`, ``)),
    }

    const getProp = (key) => properties[key].value
    const setProp = (key, v) => v === properties[key].value ? undefined : properties[key].next(v)

    let methods = {
        id: ID(`field`),
        processMethods: [`split`, `join`, `slice`],
        processContainer: undefined,
        root,

        get field() { return getProp(`field`) },
        set field(v) { setProp(`field`, v) },
        get name() { return getProp(`name`) },
        set name(v) { setProp(`name`, v) },
        get processes() { return getProp(`processes`) },
        set processes(v) { setProp(`processes`, v) },
        get defaultValue() { return getProp(`defaultValue`) },
        set defaultValue(v) { setProp(`defaultValue`, v) },

        data() {
            return {
                name: methods.name,
                field: methods.field,
                defaultValue: methods.defaultValue,
                processes: methods.processes
            }
        },

        newProcessMethod(name) {
            return { name, params: processParams[name].slice().map(p => Object.assign({}, p)) }
        },

        newProcess(process) {
            const newProcess = Object.assign({ id: ID(`process`) }, methods.newProcessMethod(`split`), process)
            methods.processes = methods.processes.concat([newProcess])
        },

        updateProcess(process) {
            const index = methods.getProcessIndex(process.id)
            const processes = methods.processes.slice()
            processes[index] = process
            methods.processes = processes
        },

        getProcessIndex(id) {
            let index = 0
            let found = false
            while (!found) {
                if (methods.processes[index].id === id) {
                    found = true
                    break
                }
                index = index + 1
            }
            return index
        },

        removeProcess(id) {
            const index = methods.getProcessIndex(id)
            const processes = methods.processes.slice()
            const elToDelete = document.getElementById(id)
            processes.splice(index, 1)
            elToDelete.parentElement.removeChild(elToDelete)
            methods.processes = processes
        },

        save() { return root.save() },

        markup() {
            const markup = FieldsMarkup(methods, root)
            requestAnimationFrame(() => {
                if (dataToLoad && dataToLoad.processes) {
                    dataToLoad.processes.forEach(methods.newProcess)
                }
            })
            return markup
        }
    }

    properties.processes.subscribe(p => RenderProcesses(methods, p))

    Object.keys(properties).forEach(key => { properties[key].subscribe(root.save) })

    return methods
}

export default FieldsElement