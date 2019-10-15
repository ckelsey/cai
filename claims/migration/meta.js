const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`

const keys = []

MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
    if (err) { throw err }

    const db = conn.db(`vehicles`)

    db.collection(`all_manufactured`).find()
        .toArray()
        .then(c => c.forEach(i => Object.keys(i).forEach(key => keys.indexOf(key) === -1 ? keys.push(key) : undefined)))
        .then(() => {
            console.log(keys)
        })
})
