const addItem = (methods, state) => (elData, page, svg) => {
    page.addElement(elData)

    methods.setCurrentElement(
        methods.renderPageElement(
            page.elements[elData.id],
            page,
            svg
        )
    )

    state.save()
}

export default addItem