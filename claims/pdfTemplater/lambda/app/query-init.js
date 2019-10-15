const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`

const getKeys = (arr, name) => {
    if (!arr || typeof arr.map !== `function`) {
        return {
            name
        }
    }
    return {
        name,
        count: arr.length,
        keys: arr.map(a => Object.keys(a)).reduce((result, cur) => [...new Set(result.concat(cur))], []),
        lastUpdate: new Date().getTime()
    }
}

const write = (db, c) => db.collection(`metadata`).insertOne(c)

const getCollection = (db, name) => {
    return db.collection(name)
        .find()
        .toArray()
        .then(c => write(db, getKeys(c, name)))
}

const setMetadata = db => getCollection(db, `settlements`)
    .then(() => getCollection(db, `claims`))
    .then(() => getCollection(db, `users`))

const queryInit = () => {
    let db

    return MongoClient.connect(url, { useNewUrlParser: true })
        .then(connection => {
            db = connection.db(`cai`)
            return db.collection(`metadata`).find().toArray()
        })
        .then(metadata => {
            if (metadata.length === 0) {
                setMetadata(db)
                throw new Error(`no metadata`)
            }

            if (metadata[0].lastUpdate < new Date().getTime() - ((1000 * 60) * 24)) {
                setMetadata(db)
            }

            const result = {}
            metadata.forEach(m => result[m.name] = m)

            return JSON.stringify(result)
        })
}

module.exports = queryInit