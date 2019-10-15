const elementData = (methods, state) => el => methods.currentPage().elements[el.id] || state.pages.map(p => p.elements[el.id] || false).filter(p => !!p)[0]
export default elementData