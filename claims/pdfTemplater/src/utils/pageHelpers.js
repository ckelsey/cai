export const FontFamilies = [`sans-serif`, `serif`, `monospace`]
export const PageElements = {
    tabs: {},
    tabContent: {},
}

Array.from(document.body.querySelectorAll(`button[tab]`))
    .forEach(tab => PageElements.tabs[tab.getAttribute(`tab`)] = tab)

Array.from(document.body.querySelectorAll(`[tab-content]`))
    .forEach(tabContent => PageElements.tabContent[tabContent.getAttribute(`tab-content`)] = tabContent)


export const SelectValue = select => select.selectedOptions[0] ? select.selectedOptions[0].value : undefined
export const InitialTabKey = () => Object.keys(PageElements.tabs)[0]
export const DisableTabs = () => {
    Object.keys(PageElements.tabs)
        .forEach((key, index) => {
            if (index === 0) {
                PageElements.tabs[key].classList.add(`active`)
                PageElements.tabContent[key].classList.add(`active`)
            } else {
                PageElements.tabs[key].classList.remove(`active`)
                PageElements.tabContent[key].classList.remove(`active`)
                PageElements.tabs[key].classList.add(`disabled`)
                PageElements.tabContent[key].classList.add(`disabled`)
            }
        })
}
export const EnableTabs = () => {
    Object.keys(PageElements.tabs)
        .forEach(key => {
            PageElements.tabs[key].classList.remove(`disabled`)
            PageElements.tabContent[key].classList.remove(`disabled`)
        })
}
export const SetActiveTab = tab => {
    Object.keys(PageElements.tabs)
        .forEach(key => {
            if (tab === key) {
                PageElements.tabs[key].classList.add(`active`)
                PageElements.tabContent[key].classList.add(`active`)
            } else {
                PageElements.tabs[key].classList.remove(`active`)
                PageElements.tabContent[key].classList.remove(`active`)
            }
        })
}
export const ClearInput = input => {
    input.value = ``
    input.removeAttribute(`value`)

    const options = Array.from(input.querySelectorAll(`option`))

    if (options.length) {
        options.forEach(o => o.removeAttribute(`selected`))
    }
}