import { InitialTabKey } from '../pageHelpers'

export const DefaultState = name => ({
    pages: [],
    currentPage: 1,
    data: {},
    styles: {
        fontFamily: `san-serif`,
        fontSize: `12px`,
        letterSpacing: `3px`,
        color: "#333"
    },
    name,
    tab: InitialTabKey()
})

export const localStorageKey = `clarence`