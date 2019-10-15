import Subject from '../observe/subject'
import newElement from './stateElement'

const newPage = (v, saveState) => {
    // const _d = new Subject(v.data)
    const file = new Subject(v.file)
    const elements = {}

    Object.keys(v.elements).forEach(elId => {
        elements[elId] = newElement(v.elements[elId], saveState)
    })

    return {
        get file() { return file.value },
        set file(nv) {
            if (typeof nv !== `string` || nv === file.value) { return }
            file.next(nv)
        },
        // get data() { return _d.value },
        // set data(nv) {
        //     if (typeof nv !== `string` || nv === _d.value) { return }
        //     _d.next(nv)
        // },
        id: v.id,
        get elements() {
            return elements
        },
        addElement(el) {
            elements[el.id] = newElement(el, saveState)
        }
    }
}

export default newPage