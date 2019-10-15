import Subject from '../../utils/observe/subject'
import SourceElement from './source'
import { API } from '../../utils/api'

const Database = (rootElement, data, metadata, saveStateFn) => {
    let Meta = new Subject(metadata)
    const Data = new Subject(data)

    const methods = {
        get data() {
            return Data.value
        },
        set data(d) {
            Data.next(d)
        },

        get metadata() {
            return Meta.value
        },
        set metadata(meta) {
            Meta.next(meta)
        },

        ready: false,
        sources: [],

        getPath(id, path = ``, source = methods.sources) {
            for (let i = 0; i < source.length; i++) {
                if (source[i].id === id) { return `${path}${i}` }

                const join = source[i].joins ? methods.getPath(id, `${path}${i}.joins.`, source[i].joins) : false
                if (join) { return join }

                const field = source[i].fields ? methods.getPath(id, `${path}${i}.fields.`, source[i].fields) : false
                if (field) { return field }

                const customFields = source[i].customFields ? methods.getPath(id, `${path}${i}.customFields.`, source[i].customFields) : false
                if (customFields) { return customFields }

                const query = source[i].queries ? methods.getPath(id, `${path}${i}.queries.`, source[i].queries) : false
                if (query) { return query }
            }
        },

        newSource() {
            rootElement.innerHTML = ``
            const newSource = SourceElement(methods, methods.data)
            methods.sources.push(newSource)
            rootElement.appendChild(newSource.markup())

            // TODO - not sure why, but for the preview tab, the data has not been fully populated or something, resulting in a bad query
            setTimeout(() => {
                methods.ready = true
            }, 1000)
        },

        getQuery() {
            return methods.sources.map(s => s.getData())[0]
        },

        runQuery() {
            const query = methods.sources.map(s => s.getData())[0]
            return API({ path: `query/get`, data: JSON.stringify(query) })
        },

        save() {
            if (!methods.sources || !methods.sources[0]) { return }
            saveStateFn(methods.sources[0].data())
        },
    }

    methods.newSource()

    return methods
}

export default Database