const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const { Parser } = require('json2csv')
const fs = require('fs')

MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
    if (err) { throw err }

    const db = conn.db(`cai`)

    db.collection(`autos`).find({}).toArray((err, d) => {
        if (err) { throw err }



        const fields = Object.keys(d[0])
        const opts = { fields }

        try {
            const parser = new Parser(opts)
            const csv = parser.parse(d)
            fs.writeFileSync(`autos.csv`, csv)
            process.exit()
        } catch (err) {
            console.error(err)
        }
    })
})