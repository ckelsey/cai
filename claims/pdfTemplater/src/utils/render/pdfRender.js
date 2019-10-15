import { API } from '../../utils/api'
import Drag from '../drag'
import CreateElement from '../html/create'
import CreateOptions from '../html/options'
import { SelectValue, FontFamilies } from '../pageHelpers'

const PdfRenderer = (state, renderContainer, editContentContainer) => {
    const pageContainerDoc = iframe => iframe.contentWindow.document
    const pageContainerId = id => `iframe_${id}`
    const getPageIdFromIframe = id => id.split(`iframe_`)[1]
    const getPageDoc = id => {
        const el = document.getElementById(pageContainerId(id))
        return el ? pageContainerDoc(el) : undefined
    }
    const svgId = id => `svg_page_${id}`
    const getPageNumber = id => state.pages.map(p => p.id).indexOf(id) + 1
    const isCurrentPage = id => getPageNumber(id) === state.currentPage
    const iframeClass = `page_container`
    const svgElementClass = `svg_page_element`
    const SVGStrings = {}
    const iframeStyles = `
        body{margin:0px;}
        body>svg{width:100%;height:auto}
        svg .${svgElementClass}.active,
        svg .${svgElementClass}{cursor:pointer;}
        svg .${svgElementClass}:hover{
            outline:#4dbce1;outline-style:dotted;outline-offset:-1px;outline-width:2px;
        }`

    const documentClick = e => {
        const el = methods.getActivePageElement()
        return e.target === el ? false : methods.unsetActiveElement(el)
    }

    let globalStyleTimer
    const elementTimers = {}

    const methods = {
        pageContainerId,
        pageContainerDoc,
        svgId,
        getPageDoc,
        activeElementDocument: undefined,
        activatingElement: false,

        dispose: () => {
            renderContainer.innerHTML = ``

            if (editContentContainer) {
                editContentContainer.innerHTML = ``
            }
        },

        currentPageElement() {
            return state.getCurrentPage() ?
                document.getElementById(
                    pageContainerId(
                        state.getCurrentPage().id
                    )
                ) :
                undefined
        },

        currentPageSvg() {
            return pageContainerDoc(methods.currentPageElement())
                .getElementById(
                    svgId(state.getCurrentPage().id)
                )
        },

        setCurrentPage() {
            Array
                .from(
                    renderContainer.querySelectorAll(`iframe.${iframeClass}`)
                )
                .forEach(iframe => {
                    if (isCurrentPage(getPageIdFromIframe(iframe.id))) {
                        iframe.classList.add(`active`)
                    } else {
                        iframe.classList.remove(`active`)
                    }
                })
        },

        unsetActiveElement(element) {
            methods.activeElementDocument.removeEventListener(`click`, documentClick, false)

            if (!methods.activatingElement && editContentContainer) {
                editContentContainer.innerHTML = ``
            }

            if (element) {
                element.classList.remove(`active`)
            }
        },

        setActiveElement(elData) {
            if (!editContentContainer) { return }

            let activeElement

            const createInput = field => {
                const tag = field === `fontFamily` ?
                    `select` : `input`

                const isStyleField = elData.styles.hasOwnProperty(field)
                const type = [`fontSize`, `letterSpacing`].indexOf(field) > -1 ? `number` : `text`
                const value = (isStyleField ? elData.styles[field] : elData[field]) || ``
                const inputAttr = { type, value, min: `0` }
                const attributes = field === `fontFamily` ? undefined : inputAttr
                const fontFamilyEvent = select => elData.styles.fontFamily = SelectValue(select)
                const styleEvent = input => elData.styles[field] = input.value
                const attrEvent = input => elData[field] = input.value
                const event = isStyleField ? field === `fontFamily` ? fontFamilyEvent : styleEvent : attrEvent
                const textContent = `${field.charAt(0).toUpperCase()}${field.slice(1)}`
                    .match(/[A-Z][a-z]+/g)
                    .map((t, i) => !!i ? t.toLowerCase() : `${t.charAt(0).toUpperCase()}${t.slice(1)}`)
                    .join(` `)

                const run = field !== `fontFamily` ? undefined : select => CreateOptions({
                    parent: select,
                    empty: `Select font`,
                    values: FontFamilies,
                    value: elData.styles.fontFamily
                })

                return CreateElement({
                    parent: editContentContainer,
                    tag: `div`,
                    attributes: { className: `inputContainer vertical-margin` },
                    run: parent => {
                        CreateElement({ parent, tag: `label`, attributes: { textContent } })
                        CreateElement({ parent, tag, events: { input: event }, attributes, run })
                    }
                })
            }

            Array
                .from(
                    renderContainer.querySelectorAll(`iframe.${iframeClass}`)
                )
                .forEach(iframe =>
                    Array.from(
                        pageContainerDoc(iframe)
                            .querySelectorAll(`.${svgElementClass}`)
                    ).forEach(el => {
                        if (el.id === elData.id) {
                            el.classList.add(`active`)
                            activeElement = el
                        } else {
                            el.classList.remove(`active`)
                        }
                    })
                )

            if (activeElement) {
                methods.activatingElement = true

                editContentContainer.innerHTML = ``

                if (activeElement.tagName.toLowerCase() === `text`) {
                    createInput(`text`)
                    Object.keys(state.styles).forEach(createInput)
                }

                requestAnimationFrame(() => {
                    methods.activeElementDocument = activeElement.ownerDocument
                    methods.activeElementDocument.addEventListener(`mousedown`, documentClick, false)
                    methods.activatingElement = false
                })
            }
        },

        getAllPageElements(page) {
            const doc = getPageDoc(page.id)
            return !doc ? [] : Array.from(getPageDoc(page.id).querySelectorAll(`.${svgElementClass}`))
        },

        getActivePageElement() {
            return pageContainerDoc(methods.currentPageElement()).querySelector(`.${svgElementClass}.active`)
        },

        getPageElement(elementData) {
            if (!elementData || !elementData.parentId) { return }

            const doc = pageContainerDoc(document.getElementById(elementData.parentId))

            if (!doc) { return }

            return doc.getElementById(elementData.id)
        },

        renderPageAndSetCurrent(page) {
            return methods.renderPage(page)
                .then(methods.setCurrentPage)
        },

        renderPage(page) {
            if (!page) { return Promise.reject(`no pages`) }
            const renderSvg = svgString => {
                const id = page.id
                const existingIframe = document.getElementById(pageContainerId(id))
                const styleEl = document.createElement(`style`)
                const newPage = document.createElement(`iframe`)
                const svgID = svgId(id)
                const svg = new DOMParser().parseFromString(svgString, `application/xml`)

                if (existingIframe) {
                    existingIframe.parentElement.removeChild(existingIframe)
                }

                styleEl.innerHTML = iframeStyles
                newPage.id = pageContainerId(id)
                newPage.className = iframeClass
                renderContainer.appendChild(newPage)
                pageContainerDoc(newPage).head.appendChild(styleEl)
                pageContainerDoc(newPage).body.appendChild(newPage.ownerDocument.importNode(svg.documentElement, true))

                const svgEl = pageContainerDoc(newPage).body.querySelector(`svg`)
                svgEl.id = svgID

                Object.keys(page.elements).forEach(key => methods.renderPageElement(page.elements[key], page))

                return svgEl
            }

            if (SVGStrings[page.id]) {
                return Promise.resolve(renderSvg(SVGStrings[page.id]))
            } else {
                return API({ path: page.file })
                    .then(svgString => {
                        SVGStrings[page.id] = svgString
                        return renderSvg(SVGStrings[page.id])
                    })
            }
        },

        renderPageElement(elementData, page) {
            const NS = `http://www.w3.org/2000/svg`
            const iframe = pageContainerDoc(document.getElementById(pageContainerId(page.id)))
            const svg = iframe.getElementById(svgId(page.id))
            const newEl = elementData.tag === `image` ?
                document.createElementNS(NS, `image`) :
                document.createElementNS(NS, `text`)

            newEl.classList.add(svgElementClass)
            newEl.id = elementData.id
            newEl.addEventListener(`mousedown`, () => { methods.activatingElement = true })
            newEl.addEventListener(`click`, e => {
                e.preventDefault()
                methods.setActiveElement(elementData)
            })


            svg.appendChild(newEl)
            elementData.initElement()
            Drag(newEl, elementData, svg, state.save)

            const styleSub = elementData.subscribeStyles(() => {
                methods.applyStyles(elementData)
            })

            methods.applyStyles(elementData)

            Object.keys(styleSub)
                .forEach(key => state.subscriptions[`subscribeStyles_${elementData.id}_${key}`] = styleSub[key])

            return newEl
        },

        render() {
            methods.renderPage(state.getCurrentPage())
                .then(() => {
                    methods.setCurrentPage()
                })
                .catch(console.log)
        },

        applyStyles(elementData) {
            methods.applyGlobalStyles(elementData)
            methods.applyElementStyles(elementData)
        },

        applyElementStyles(elementData) {
            if (!elementData) { return }

            clearTimeout(elementTimers[elementData.id])

            elementTimers[elementData.id] = setTimeout(() => {

                const element = methods.getPageElement(elementData)

                if (!element) { return }

                Object.keys(elementData.styles)
                    .forEach(key => {
                        const elStyle = elementData.styles[key]
                        if (!!elStyle) {
                            element.style[key === `color` ? `fill` : key] = [`letterSpacing`, `fontSize`].indexOf(key) > -1 ? `${parseInt(elStyle)}px` : elStyle
                        }
                    })
            }, 66)
        },

        applyGlobalStyles() {
            clearTimeout(globalStyleTimer)

            globalStyleTimer = setTimeout(() => {
                const page = state.getCurrentPage()

                if (!page) { return }

                const elements = methods.getAllPageElements(page)

                Object.keys(state.styles)
                    .forEach(key => elements
                        .forEach(element => {

                            const elStyle = page.elements[element.id].styles[key]

                            if (elStyle === `` || elStyle === undefined) {
                                const val = state.styles[key]
                                element.style[key === `color` ? `fill` : key] = [`letterSpacing`, `fontSize`].indexOf(key) > -1 ? `${parseInt(val)}px` : val
                            }
                        })
                    )
            }, 66)
        }
    }

    return methods
}

export default PdfRenderer