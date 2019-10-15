const vm = require('vm')
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const url = `mongodb://localhost:27017`
const get = require('./utils/get')

const mergeData = (name, item, data) => Object.assign({}, data, {
    [name]: item
})

const parseVal = (str, data) => {
    if (!str || typeof str !== `string` || str.indexOf(`{{`) === -1) { return str }
    str = str
        .split(`{{`)
        .map(s => {
            if (s.indexOf(`}}`) === -1) { return s }

            return s
                .split(`}}`)
                .map((_s, i) => {
                    if (i) { return _s }

                    return get(data, _s)
                })
                .join(``)
        }).join(``)
    return str
}

const formatQuery = (queries, data) => {
    const _queries = {}

    Object.keys(queries).forEach(queryKey => {
        const obj = queries[queryKey]

        if (typeof obj === `object`) {
            _queries[queryKey] = {}
            Object.keys(obj).forEach(objKey => {
                _queries[queryKey][objKey] = parseVal(obj[objKey], data)

                if (mongodb.ObjectID.isValid(_queries[queryKey][objKey])) {
                    _queries[queryKey][objKey] = mongodb.ObjectID(_queries[queryKey][objKey])
                }
            })
        } else {
            _queries[queryKey] = parseVal(obj, data)

            if (mongodb.ObjectID.isValid(_queries[queryKey])) {
                _queries[queryKey] = mongodb.ObjectID(_queries[queryKey])
            }
        }
    })

    return _queries
}

const getFields = (item, fields = [], customFields = [], data) => {
    if (fields.length === 0 && customFields.length === 0) { return item }

    const result = {}

    fields.forEach(field => {
        const fieldName = !!field.name ? field.name : field.field
        const fieldKey = field.field
        const itemValue = item[fieldKey]

        if (itemValue === 0 || !!itemValue) {
            result[fieldName] = itemValue

            result[fieldName] = field.processes.reduce((previousValue, currentValue) => {
                try {
                    switch (currentValue.name) {
                        case `slice`:
                            return previousValue.slice(
                                parseInt(currentValue.params[0].value),
                                parseInt(currentValue.params[1].value)
                            )

                        case `split`:
                            return previousValue.toString().split(currentValue.params[0].value || ``)
                        case `join`:
                            return previousValue.join(currentValue.params[0].value || ``)
                    }

                    throw new Error(`invalid method name`)
                } catch (error) {
                    return previousValue
                }

            }, result[fieldName])
        } else {
            result[fieldName] = field.defaultValue
        }
    })

    customFields.forEach(field => {
        result[field.name] = parseVal(field.value, data)
    })

    return result
}

const getQuery = (body, db, data) => {
    const _body = Object.assign({}, body)
    const queries = formatQuery(_body.query.queries, data)

    return db.collection(_body.query.collection)
        .find(queries).toArray()
        .then(res => Promise.all(res.map(
            item => {
                const result = getFields(item, _body.fields, _body.customFields, mergeData(_body.query.name, item, data))

                if (!_body.joins || !_body.joins.length) {
                    return Promise.resolve(result)
                } else {
                    return Promise.all(
                        _body.joins.map(join => {
                            return getQuery(join, db, {
                                [_body.query.name]: item
                            })
                        })
                    ).then(r => {
                        _body.joins.forEach((join, index) => result[join.query.name] = r[index])
                        return Promise.resolve(result)
                    })
                }
            }
        )))
}

const queryGet = body => {
    let db

    try { body = JSON.parse(body.toString()) } catch (error) { }

    return MongoClient.connect(url, { useNewUrlParser: true })
        .then(connection => {
            db = connection.db(`cai`)
            return getQuery(body, db)
        })
        .then(result => {
            const expressedResult = !!body.expression ? vm.runInNewContext(body.expression, { data: result, log: console.log }) : result
            return JSON.stringify(expressedResult)
        })
}

module.exports = queryGet