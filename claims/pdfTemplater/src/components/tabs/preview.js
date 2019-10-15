import PdfRenderer from '../../utils/render/pdfRender'
import CreateElement from '../../utils/html/create'
import ElementHandler from '../../utils/element-handler'

const PreviewTab = state => {
    let Elements
    let tempState

    const setElements = s => {
        if (Elements) { Elements.reset() }

        Elements = ElementHandler([
            { id: `testPdfBtn`, event: `click` },
            { id: `pageNumberInputPreview`, event: `input` },
            { id: `svgEditorPreview` },
            { id: `previewQueryResults` },
            { id: `pageCountPreview` },
        ], s)
    }

    setElements(state)

    state.subscribeTab(tab => {
        if (tab !== `preview`) {
            return Elements.element(`testPdfBtn`).classList.remove(`ready`)
        }

        if (state.renderer) { state.renderer.dispose() }

        const runPreview = data => {
            if (tempState) { tempState.clear() }

            tempState = state.getTempState(data)

            const renderPage = pageNumber => {
                const currentPage = tempState.pages[pageNumber - 1]

                if (tempState.renderer && currentPage) {
                    tempState.renderer.renderPageAndSetCurrent(currentPage)
                }

                Elements.element(`pageNumberInputPreview`).value = pageNumber
            }
            const updatePageNumber = e => {
                tempState.currentPage = e.target.value
                renderPage(tempState.currentPage)
            }

            tempState.renderer = PdfRenderer(
                tempState,
                Elements.element(`svgEditorPreview`)
            )

            setElements(tempState)
            Elements.subscribe(`pageNumberInputPreview`)(updatePageNumber)
            Elements.subscribe(`testPdfBtn`)(state.export)
            renderPage(tempState.currentPage)
        }

        runPreview()

        const checkDB = () => {
            if (!state.DB || !state.DB.ready) { return requestAnimationFrame(checkDB) }

            state.DB.runQuery()
                .then(results => {
                    const resultElement = Elements.element(`previewQueryResults`)
                    resultElement.innerHTML = ``

                    if (!results) { return }

                    let index = 0

                    while (results[index] && index < 10) {
                        const i = index
                        CreateElement({
                            parent: resultElement,
                            tag: `div`,
                            attributes: { className: `previewQueryResult`, textContent: `item ${index + 1}` },
                            events: {
                                click: el => {
                                    const activeEl = resultElement.querySelector(`.active`)

                                    if (activeEl) { activeEl.classList.remove(`active`) }

                                    el.classList.add(`active`)

                                    runPreview(results[i])
                                }
                            }
                        })
                        index = index + 1
                    }

                    if (results.length) {
                        Elements.element(`testPdfBtn`).classList.add(`ready`)
                    }
                })
                // TODO
                .catch(console.log)
        }

        checkDB()
    })
}

export default PreviewTab