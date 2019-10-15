const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')

const model = t => {

    return {
        _id: validate.ObjectID(t._id),
        name: validate.string(t.concatString, ''),
    }
}

const get = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`vehicles`)

            db.collection(`takata_eligible`).find({}).toArray((err, t) => {
                if (err) { throw err }
                resolve(t.map(model))
            })
        })
    })
}

module.exports = get