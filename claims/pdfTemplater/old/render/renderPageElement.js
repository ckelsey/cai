import Drag from '../../utils/drag'

const renderPageElement = (methods, state) => (elData, page, svg) => {
    const NS = `http://www.w3.org/2000/svg`
    const iframe = document.getElementById(methods.getIframeId(page.id))
    const newEl = elData.tag === `image` ?
        document.createElementNS(NS, `image`) :
        document.createElementNS(NS, `text`)

    if (!svg) {
        svg = methods.getIframeDoc(iframe).getElementById(methods.getSvgId(page.id))
    }

    newEl.id = elData.id

    newEl.addEventListener(`click`, e => {
        e.preventDefault()
        e.stopPropagation()
        methods.setCurrentElement(newEl)
    })

    svg.appendChild(newEl)

    elData.initElement()

    Drag(newEl, elData, svg, state.save)

    methods.applyElementStyles(elData)

    return newEl

}

export default renderPageElement