import { ImgHandler } from '../imageHandler'
import PdfRenderer from '../../utils/render/pdfRender'
import { ClearInput } from '../../utils/pageHelpers'
import { popup } from '../popup'
import { PDFHandler } from '../../utils/pdfHandler'
import AddImage from '../../utils/render/addImage'
import AddText from '../../utils/render/addText'
import { API } from '../../utils/api'
import ElementHandler from '../../utils/element-handler'

const imageHandler = ImgHandler(`#selectImg`)
const pdfHandler = PDFHandler(`#selectSVG`)
const modalSVG = popup(`#selectSVGPopup`)
const modalImage = popup(`#selectImgPopup`)
const TemplateTab = state => {
    const Elements = ElementHandler([
        { id: `svgEditor` },
        { id: `editContentContainer` },
        { id: `selectSVGPopup` },
        { id: `selectSVG` },
        { id: `pageCount` },
        { id: `pageNumberInput`, event: `input` },
        { id: `addPagesBtn`, event: `click` },
        { id: `deletePageBtn`, event: `click` },
        { id: `addImageBtn`, event: `click` },
        { id: `addTextBtn`, event: `click` },
        { id: `fontFamily`, event: `input` },
        { id: `fontSize`, event: `input` },
        { id: `letterSpacing`, event: `input` },
        { id: `color`, event: `input` },
    ], state)

    const updateCurrentPage = e => state.currentPage = e.target.value
    const addText = () => AddText(state)
    const updateStyle = key => e => state.styles[key] = e.target.value
    const renderPage = pageNumber => {
        const currentPage = state.pages[pageNumber - 1]

        if (state.renderer && currentPage) {
            state.renderer.renderPageAndSetCurrent(currentPage)
        }

        Elements.element(`pageNumberInput`).value = pageNumber
    }
    const updatePages = pages => {
        Elements.element(`pageCount`).textContent = pages.length
        Elements.element(`pageNumberInput`).setAttribute(`max`, pages.length)
        renderPage(state.currentPage)
    }
    const deletePage = () => {
        // TODO
    }

    Elements.subscribe(`pageNumberInput`)(updateCurrentPage)
    Elements.subscribe(`addPagesBtn`)(modalSVG.open)
    Elements.subscribe(`deletePageBtn`)(deletePage)
    Elements.subscribe(`addTextBtn`)(addText)
    Elements.subscribe(`addImageBtn`)(modalImage.open)
    Elements.subscribe(`fontFamily`)(updateStyle(`fontFamily`))
    Elements.subscribe(`fontSize`)(updateStyle(`fontSize`))
    Elements.subscribe(`letterSpacing`)(updateStyle(`letterSpacing`))
    Elements.subscribe(`color`)(updateStyle(`color`))

    state.subscribePages(updatePages)
    state.subscribeCurrentPage(renderPage)

    // modalSVG.subscribe(`close`, state.pages.length ? ClearInput(Elements.element(`selectSVG`)) : modalSVG.open())

    pdfHandler.subscribe(`file`, data => {
        modalSVG.close()

        API({ path: `project/addpage/${state.name}`, data })
            .then(apiData => {
                apiData.forEach(state.pushPage)
                modalSVG.close()
            })
    })

    pdfHandler.subscribe(`error`, error => {
        console.log(error)
        modalSVG.close()
        // TODO
    })

    imageHandler.subscribe(`file`, img => {
        modalImage.close()
        AddImage(state, img.src, img.width, img.height)
    })

    imageHandler.subscribe(`error`, error => {
        modalImage.close()
        console.log(error)
        // TODO
    })

    state.subscribeTab(tab => {
        if (tab !== `template`) { return }

        if (state.renderer) {
            state.renderer.dispose()
        }

        state.renderer = PdfRenderer(
            state,
            Elements.element(`svgEditor`),
            Elements.element(`editContentContainer`)
        )

        state.subscribeStyles(styles => {
            state.renderer.applyGlobalStyles(styles)

            Object.keys(styles).forEach(key => {
                switch (key) {
                    case `fontFamily`:
                        Elements.element(`fontFamily`).value = styles.fontFamily
                        break;
                    case `color`:
                        Elements.element(`color`).value = styles.color
                        break;
                    default:
                        Elements.element(key).value = parseInt(styles[key])
                        break;
                }
            })
        })

        state.renderer.render()
    })

    return Elements
}

export default TemplateTab