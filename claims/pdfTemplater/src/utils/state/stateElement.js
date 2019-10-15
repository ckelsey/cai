import newStyles from './stateStyles'
import Subject from '../observe/subject'

const newElement = (el, saveState) => {
    const x = new Subject(el.x)
    const y = new Subject(el.y)
    const w = new Subject(el.w || `auto`)
    const h = new Subject(el.h || `auto`)
    const href = new Subject(el.href)
    const text = new Subject(el.text)
    const stylesObj = newStyles(el.styles)
    const styles = stylesObj.styles

    const getElement = () => {
        const parent = document.getElementById(el.parentId)
        const element = el.element
        if (element) { return element }
        if (parent) { return parent.contentWindow.document.getElementById(el.id) }
    }
    const setProp = (element, prop, v) => !!element ?
        prop === `href` ?
        element.setAttributeNS(null, prop, v) :
        isNaN(parseInt(v)) ?
        undefined :
        element.setAttributeNS(null, prop, v) :
        undefined
    const setText = (element, v) => !!element ? element.textContent = v : undefined

    w.subscribe(saveState)
    h.subscribe(saveState)
    x.subscribe(saveState)
    y.subscribe(saveState)
    href.subscribe(saveState)
    text.subscribe(saveState)
    stylesObj.fontFamily.subscribe(saveState)
    stylesObj.fontSize.subscribe(saveState)
    stylesObj.letterSpacing.subscribe(saveState)
    stylesObj.color.subscribe(saveState)

    return {
        tag: el.tag,
        id: el.id,
        parentId: el.parentId,
        getElement,
        get w() { return w.value },
        set w(v) {
            if (v === w.value) { return }
            w.next(v)
            setProp(getElement(), `width`, v)
        },
        get h() { return h.value },
        set h(v) {
            if (v === h.value) { return }
            h.next(v)
            setProp(getElement(), `height`, v)
        },
        get x() { return x.value },
        set x(v) {
            v = parseFloat(v)
            if (isNaN(v) || v === x.value) { return }
            x.next(v)
            setProp(getElement(), `x`, v)
        },
        get y() { return y.value },
        set y(v) {
            v = parseFloat(v)
            if (isNaN(v) || v === y.value) { return }
            y.next(v)
            setProp(getElement(), `y`, v)
        },
        get href() { return href.value },
        set href(v) {
            if (v === href.value) { return }
            href.next(v)
            setProp(getElement(), `href`, v)
        },
        get text() { return text.value },
        set text(v) {
            if (v === text.value) { return }
            text.next(v)
            setText(getElement(), v)
        },
        get styles() { return styles },
        set styles(v) {
            if (!v) { return }

            Object.keys(styles).forEach(key => {
                if (!v.hasOwnProperty(key)) { return }
                if (v[key] === styles[key]) { return }
                styles[key] = v[key]
            })
        },

        initElement() {
            setProp(getElement(), `width`, w.value)
            setProp(getElement(), `height`, h.value)
            setProp(getElement(), `x`, x.value)
            setProp(getElement(), `y`, y.value)
            if (!!href.value) { setProp(getElement(), `href`, href.value) }
            if (!!text.value) { setText(getElement(), text.value) }
        },

        subscribeStyles: fn => {
            const triggerFn = () => fn(styles)
            const fontFamilySub = stylesObj.fontFamily.subscribe(triggerFn)
            const fontSizeSub = stylesObj.fontSize.subscribe(triggerFn)
            const letterSpacingSub = stylesObj.letterSpacing.subscribe(triggerFn)
            const colorSub = stylesObj.color.subscribe(triggerFn)

            return { fontFamilySub, fontSizeSub, letterSpacingSub, colorSub }
        },
    }
}

export default newElement