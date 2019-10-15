const currentPage = state => () => state.pages[state.currentPage - 1]
export default currentPage