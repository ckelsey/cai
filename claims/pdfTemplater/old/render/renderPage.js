import { API } from '../../api/api'

const renderPage = (methods, pageElements) => page => {

    return API({ path: page.file })
        .then(svgString => {
            const id = page.id
            const styleEl = document.createElement(`style`)
            const newPage = document.createElement(`iframe`)
            const svgId = methods.getSvgId(id)
            const svg = new DOMParser().parseFromString(svgString, `application/xml`)

            styleEl.innerHTML = `body{margin:0px;}body>svg{width:100%;height:auto}svg image:hover{outline:#4dbce1;outline-style:dotted;outline-offset:-1px;outline-width:2px;}`
            newPage.id = methods.getIframeId(id)
            newPage.className = `page_container`
            pageElements.editorContainer.appendChild(newPage)
            methods.getIframeDoc(newPage).head.appendChild(styleEl)
            methods.getIframeDoc(newPage).body.appendChild(newPage.ownerDocument.importNode(svg.documentElement, true))

            const svgEl = methods.getIframeDoc(newPage).body.querySelector(`svg`)
            svgEl.id = svgId

            Object.keys(page.elements).forEach(key => methods.renderPageElement(page.elements[key], page, svgEl))

            return svgEl
        })
}

export default renderPage