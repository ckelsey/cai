import Subject from '../../utils/observe/subject'
import ID from '../../utils/id'
import { ValueElement, QueryMarkup } from './queryMarkup'
import Get from '../../utils/get'

const QueryElement = (sourceMeta, root, dataToLoad) => {
    const operators = [
        `equals`,
        `not equal to`,
        `contains`,
        `empty`,
        `not empty`,
        `greater than`,
        `greater than or equal to`,
        `less than`,
        `less than or equal to`,
        `in`,
        `not in`
    ]

    const types = [
        `string`,
        `number`,
        `date`,
        `data`,
    ]

    const properties = {
        field: new Subject(Get(dataToLoad, `field`, sourceMeta.keys[0])),
        operator: new Subject(Get(dataToLoad, `operator`, operators[0])),
        type: new Subject(Get(dataToLoad, `type`, types[0])),
        value: new Subject(Get(dataToLoad, `value`, ``))
    }

    const getProp = (key) => properties[key].value
    const setProp = (key, v) => v === properties[key].value ? undefined : properties[key].next(v)

    let methods = {
        id: ID(`query`),
        valueField: undefined,
        operators,
        types,
        sourceMeta,
        get field() { return getProp(`field`) },
        set field(v) { setProp(`field`, v) },
        get operator() { return getProp(`operator`) },
        set operator(v) { setProp(`operator`, v) },
        get type() { return getProp(`type`) },
        set type(v) { setProp(`type`, v) },
        get value() { return getProp(`value`) },
        set value(v) { setProp(`value`, v) },
        subscribe(key, fn) { return properties[key].subscribe(fn) },

        data() {
            return {
                field: methods.field,
                operator: methods.operator,
                type: methods.type,
                value: methods.value,
            }
        },

        getQuery() {
            let result = {}
            let val
            switch (methods.type) {
                case `string`:
                    val = methods.value.toString()
                    break

                case `number`:
                    val = parseFloat(methods.value)
                    break

                case `date`:
                    val = new Date(methods.value).getTime()
                    break

                case `data`:
                    val = JSON.parse(methods.value)
                    break

                default:
                    val = methods.value
                    break
            }

            switch (methods.operator) {
                case `equals`:
                    result = { $eq: val }
                    break

                case `not equal to`:
                    result = { $ne: val }
                    break

                case `empty`:
                    result = { $exists: false }
                    break

                case `not empty`:
                    result = { $exists: true }
                    break

                case `contains`:
                    result = { $regex: `.*${val}.*` }
                    break

                case `greater than`:
                    result = { $gt: val }
                    break

                case `greater than or equal to`:
                    result = { $gte: val }
                    break

                case `less than`:
                    result = { $lt: val }
                    break

                case `less than or equal to`:
                    result = { $lte: val }
                    break

                case `in`:
                    result = { $in: val }
                    break

                case `not in`:
                    result = { $nin: val }
                    break
            }

            return {
                [methods.field]: result
            }
        },

        markup() {
            return QueryMarkup(methods, root)
        }
    }

    properties.type.subscribe(t => {
        if (!methods.valueField) { return }
        const parent = methods.valueField.parentElement
        const newEl = ValueElement(methods, root)
        parent.replaceChild(newEl, methods.valueField)
        methods.valueField = newEl
    })

    Object.keys(properties).forEach(key => { properties[key].subscribe(root.save) })

    return methods
}

export default QueryElement