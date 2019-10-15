import ID from '../../utils/id'
import Subject from '../../utils/observe/subject'
import QueryElement from './query'
import FieldsElement from './fields'
import CustomFieldsElement from './customFields'
import SourceMarkup from './sourceMarkup'
import Get from '../../utils/get'

const SourceElement = (DB, dataToLoad, root) => {
    const containers = {
        queries: undefined,
        fields: undefined,
        customFields: undefined,
        joins: undefined,
        expression: undefined
    }

    const properties = {
        name: new Subject(Get(dataToLoad, `name`, ``)),
        source: new Subject(Get(dataToLoad, `source`, ``)),
        queries: new Subject([]),
        fields: new Subject([]),
        customFields: new Subject([]),
        joins: new Subject([]),
        expression: new Subject(Get(dataToLoad, `properties.expression`, ``))
    }

    const getProp = (key) => properties[key].value
    const setProp = (key, v) => v === properties[key].value ? undefined : properties[key].next(v)

    const methods = {
        id: ID(`source`),
        dbMetadata: () => DB.metadata,
        sourceMetadata: () => DB.metadata[methods.source],

        get name() { return getProp(`name`) },
        set name(v) { setProp(`name`, v) },
        get source() { return getProp(`source`) },
        set source(v) { setProp(`source`, v) },
        get queries() { return getProp(`queries`) },
        set queries(v) { setProp(`queries`, v) },
        get fields() { return getProp(`fields`) },
        set fields(v) { setProp(`fields`, v) },
        get customFields() { return getProp(`customFields`) },
        set customFields(v) { setProp(`customFields`, v) },
        get joins() { return getProp(`joins`) },
        set joins(v) { setProp(`joins`, v) },
        get expression() { return getProp(`expression`) },
        set expression(v) { setProp(`expression`, v) },

        setQueryContainer(el) { containers.queries = el },
        setFieldsContainer(el) { containers.fields = el },
        setCustomFieldsContainer(el) { containers.customFields = el },
        setJoinContainer(el) { containers.joins = el },
        setExpressionContainer(el) { containers.expression = el },
        getPath(id) { return DB.getPath(id) },
        getSources() { return DB.sources },
        subscribe(key, fn) { return properties[key].subscribe(fn) },
        getElements(key) { return containers[key] ? Array.from(containers[key].children) : [] },
        getContainer(key) { return containers[key] },
        markup() {
            const markup = SourceMarkup(methods, root)

            methods.showHideFields()

            if (!!dataToLoad && !!dataToLoad.properties) {
                Object.keys(dataToLoad.properties).forEach(key => {
                    if (!dataToLoad.properties[key]) { return }

                    if (key === `expression`) {
                        containers.expression.querySelector(`textarea`).value = dataToLoad.properties[key]
                        return
                    }

                    dataToLoad.properties[key].forEach(item => {
                        switch (key) {
                            case `queries`:
                                methods.addQuery(item)
                                break;
                            case `fields`:
                                methods.addField(item)
                                break;
                            case `customFields`:
                                methods.addCustomField(item)
                                break;
                            case `joins`:
                                methods.addJoin(item)
                                break;
                        }
                    })
                })
            }

            return markup
        },

        data() {
            return {
                name: !root ? methods.source : methods.name,
                source: methods.source,
                properties: {
                    queries: methods.queries.map(q => q.data()),
                    fields: methods.fields.map(f => f.data()),
                    customFields: methods.customFields.map(c => c.data()),
                    joins: methods.joins.map(j => j.data()),
                    expression: methods.expression
                }
            }
        },

        getData() {
            return {
                query: methods.getQuery(),
                fields: methods.getFields(),
                customFields: methods.getCustomFields(),
                joins: methods.joins.map(j => j.getData()),
                expression: methods.expression
            }
        },

        addJoin(item) {
            methods.joins = methods.joins.concat([SourceElement(DB, item, methods)])
        },

        addField(item) {
            methods.fields = methods.fields.concat([FieldsElement(methods, item)])
        },

        addCustomField(item) {
            methods.customFields = methods.customFields.concat([CustomFieldsElement(methods, item)])
        },

        addQuery(item) {
            methods.queries = methods.queries.concat([QueryElement(methods.sourceMetadata(), methods, item)])
        },

        getFields() {
            return methods.fields.map(f => ({
                defaultValue: f.defaultValue,
                field: f.field,
                name: f.name || f.field,
                processes: f.processes.slice()
            }))
        },

        getCustomFields() {
            return methods.customFields.map(f => ({
                name: f.name,
                value: f.value
            }))
        },

        getQuery() {
            let queries = {}
            methods.queries.forEach(q => queries = Object.assign({}, queries, q.getQuery()))

            return {
                collection: methods.source,
                name: methods.name || methods.source,
                queries
            }
        },

        removeProp(id) {
            const path = DB.getPath(id)
            if (!path) { return }

            const paths = path.split(`.`)
            const index = paths.pop()
            const prop = paths.pop()
            const props = methods[prop].slice()
            const elToDelete = document.getElementById(id)

            props.splice(index, 1)
            elToDelete.parentElement.removeChild(elToDelete)
            methods[prop] = props
        },

        save() { DB.save() },

        clear() {
            methods.queries = []
            methods.fields = []
            methods.customFields = []
            methods.joins = []
            methods.showHideFields()
        },

        showHideFields() {
            let classMethod = `remove`

            if (!!methods.source) { classMethod = `add` }

            Object.keys(containers).forEach(key => {
                if (containers[key] && containers[key].parentElement) {
                    if (key === `expression`) {
                        containers[key].classList[classMethod](`active`)
                    }

                    if (classMethod === `remove`) {
                        containers[key].innerHTML = ``
                    }

                    containers[key].parentElement.classList[classMethod](`active`)
                }
            })
        }
    }

    properties.source.subscribe(methods.clear)

    Object.keys(properties).forEach(key => { properties[key].subscribe(methods.save) })

    return methods
}

export default SourceElement