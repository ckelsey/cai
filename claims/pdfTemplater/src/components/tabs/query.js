import ElementHandler from '../../utils/element-handler'

const QueryTab = state => {
    const QueryElements = ElementHandler([
        { id: `runQuery`, event: `click` },
        { id: `queryResultsContainer` },
        { id: `queryContainer` }
    ], state)

    const runQuery = () => {
        state.DB.runQuery()
            .then(results => {
                const html = `<div style="padding: 0.5rem 1rem;">Claims: ${results.length}</div><pre>${JSON.stringify(results, null, 2)}</pre>`
                QueryElements.element(`queryResultsContainer`).innerHTML = html
            })
            .catch(console.log)
    }

    QueryElements.subscribe(`runQuery`)(runQuery)

    return QueryElements
}

export default QueryTab