import { API } from '../../utils/api'
import Subject from '../observe/subject'
import newPage from './statePage'
import newStyles from './stateStyles'
import { localStorageKey } from './stateConstants'

const initState = (d) => {
    let saveDebouncer
    let saveServerDebouncer
    let s

    const savedOnServer = new Subject(new Date().getTime())

    const dataToSave = (stateObj) => {
        if (!stateObj) { return `` }

        return {
            pages: stateObj.pages,
            tab: stateObj.tab,
            currentPage: stateObj.currentPage,
            data: stateObj.data,
            name: stateObj.name,
            styles: stateObj.styles,
        }
    }

    const dataString = () => JSON.stringify(dataToSave(s))

    const exportData = (stateObj) => JSON.stringify(Object.assign({}, dataToSave(stateObj), { query: s.DB.getQuery() }))

    function saveState() {
        clearTimeout(saveDebouncer)
        saveDebouncer = setTimeout(() => {
            localStorage.setItem(localStorageKey, dataString())
            console.log(`saved project locally`)
        }, 500)
    }

    function serverSave() {
        clearTimeout(saveServerDebouncer)
        saveServerDebouncer = setTimeout(() => {
            API({ path: `project/save`, data: dataString() })
                .then(() => {
                    console.log(`saved project on server`)
                    savedOnServer.next(new Date().getTime())
                })
        }, 500)
    }

    const pages = new Subject(d.pages.map(p => newPage(p, saveState)))
    const tab = new Subject(d.tab)
    const currentPage = new Subject(d.currentPage)
    const data = new Subject(d.data)
    const name = new Subject(d.name)
    const dataStyles = d.styles && Object.keys(d.styles).length ? d.styles : {
        fontFamily: `sans-serif`,
        fontSize: 12,
        letterSpacing: 3,
        color: `#333`
    }
    const stylesObj = newStyles(dataStyles)
    const styles = stylesObj.styles
    const subscribeKey = subKey => `${subKey}_${Object.keys(s.subscriptions).length}_${new Date().getTime()}`
    const subscribeTo = (args, sub, subKey) => {
        const key = subscribeKey(subKey)
        s.subscriptions[key] = sub(args)
        return s.subscriptions[key]
    }

    s = {
        subscribeTo: subscribeTo,
        get pages() { return pages.value },
        set pages(v) {
            let vAsString = v
            let dAsString = pages.value
            try {
                vAsString = JSON.stringify(vAsString)
                dAsString = JSON.stringify(dAsString)
            } catch (error) { }

            if (vAsString === dAsString) { return }

            pages.next([])

            v.forEach(_v => s.pushPage(_v))
        },
        pushPage(v) {
            const formattedPage = newPage(v, saveState)
            const currentPages = pages.value
            currentPages.push(formattedPage)
            pages.next(currentPages)
        },
        subscribePages: fn => subscribeTo(fn, pages.subscribe, `pages`),

        get currentPage() { return currentPage.value },
        set currentPage(v) {
            v = parseInt(v)
            if (isNaN(v)) { return }
            if (v < 1) { return }
            if (v > pages.value.length) { return }
            if (v === currentPage.value) { return }

            currentPage.next(v)
        },
        getCurrentPage() {
            return s.pages[s.currentPage - 1]
        },
        subscribeCurrentPage: fn => subscribeTo(fn, currentPage.subscribe, `currentPage`),

        get data() { return data.value },
        set data(v) {
            let vAsString = v
            let dAsString = data.value
            try {
                vAsString = JSON.stringify(v)
                dAsString = JSON.stringify(data.value)
            } catch (error) { }

            if (vAsString === dAsString) { return }

            data.next(v)
        },
        subscribeData: fn => subscribeTo(fn, data.subscribe, `data`),

        get styles() { return styles },
        set styles(v) {
            if (!v) { return }

            Object.keys(styles).forEach(key => {
                if (!v.hasOwnProperty(key)) { return }
                if (v[key] === styles[key]) { return }
                styles[key] = v[key]
            })
        },
        subscribeStyles: fn => {
            const triggerFn = () => fn(styles)
            return {
                fontFamily: subscribeTo(triggerFn, stylesObj.fontFamily.subscribe, `stylesObj.fontFamily`),
                fontSize: subscribeTo(triggerFn, stylesObj.fontSize.subscribe, `stylesObj.fontSize`),
                letterSpacing: subscribeTo(triggerFn, stylesObj.letterSpacing.subscribe, `stylesObj.letterSpacing`),
                color: subscribeTo(triggerFn, stylesObj.color.subscribe, `stylesObj.color`)
            }
        },


        get name() { return name.value },
        set name(v) {
            if (typeof v !== `string`) { return }

            v = v.trim()

            if (v === name.value) { return }

            name.next(v)
        },
        subscribeName: fn => subscribeTo(fn, name.subscribe, `name`),

        get tab() { return tab.value },
        set tab(v) {
            if (v === tab.value) { return }
            tab.next(v)
        },
        subscribeTab: fn => subscribeTo(fn, tab.subscribe, `name`),

        subscribeServerSave: fn => subscribeTo(fn, savedOnServer.subscribe, `name`),
        save() { return saveState() },
        saveServer() { return serverSave() },
        saveAsServer() { return serverSave() },

        clear() {
            localStorage.removeItem(localStorageKey)
            Object.keys(s.subscriptions)
                .forEach(
                    key => s.subscriptions[key]()
                )

            if (s.renderer) {
                s.renderer.dispose()
            }
        },

        initSubject: new Subject(s, true),
        initialized$: fn => subscribeTo(fn, s.initSubject.subscribe, `initSubject`),
        subscriptions: {},

        getTempState(tempData) {
            const tempStyles = {}
            const tempPages = []

            Object.keys(s.styles).forEach(key => tempStyles[key] = s.styles[key])
            s.pages.forEach(page => {
                const elms = {}

                Object.keys(page.elements).forEach(elmKey => {
                    const elmStyles = {}
                    const element = page.elements[elmKey]

                    Object.keys(element.styles)
                        .forEach(styleKey =>
                            elmStyles[styleKey] = element.styles[styleKey]
                        )

                    const getElement = () => {
                        const parent = document.getElementById(element.parentId)
                        if (parent) { return parent.contentWindow.document.getElementById(element.id) }
                    }
                    const setProp = (domElement, prop, v) => !!domElement ?
                        prop === `href` ?
                            domElement.setAttributeNS(null, prop, v) :
                            isNaN(parseInt(v)) ?
                                undefined :
                                domElement.setAttributeNS(null, prop, v) :
                        undefined

                    const updatedData = {
                        initElement() {
                            const domEl = getElement()
                            if (!domEl) { return }
                            setProp(domEl, `width`, element.w)
                            setProp(domEl, `height`, element.h)
                            setProp(domEl, `x`, element.x)
                            setProp(domEl, `y`, element.y)
                            if (!!element.href) { setProp(domEl, `href`, element.href) }
                            if (!!element.text) { domEl.textContent = updatedData.text }
                        }
                    }

                    if (element.tag === `text`) {
                        updatedData.text = element.text

                        if (tempData && tempData[element.text]) {
                            updatedData.text = tempData[element.text]
                        }
                    }

                    elms[elmKey] = Object.assign({}, page.elements[elmKey], { styles: elmStyles }, updatedData)
                })

                tempPages.push(Object.assign({}, page, { elements: elms }))
            })

            let cp = 1

            const tempState = {
                renderer: undefined,
                pages: tempPages,
                get currentPage() { return cp },
                set currentPage(v) { cp = parseInt(v) },
                styles: tempStyles,
                save() { },
                clear() {
                    Object.keys(tempState.subscriptions)
                        .forEach(
                            key => tempState.subscriptions[key]()
                        )

                    if (tempState.renderer) {
                        tempState.renderer.dispose()
                    }
                },
                subscriptions: {},
                subscribeTo: (args, sub, subKey) => {
                    const key = subscribeKey(subKey)
                    tempState.subscriptions[key] = sub(args)
                    return tempState.subscriptions[key]
                },
                getCurrentPage() {
                    return tempPages[tempState.currentPage - 1]
                },
                export() {
                    // API({ path: 'project/export', data: exportData(s) })
                }
            }

            return tempState
        },

        export() {
            // API({ path: 'project/export', data: exportData(s) })

        }
    }

    s.subscribePages(saveState)
    s.subscribeCurrentPage(saveState)
    s.subscribeData(saveState)
    s.subscribeName(saveState)
    s.subscribeTab(saveState)
    s.subscribeStyles(saveState)

    return s
}

export default initState