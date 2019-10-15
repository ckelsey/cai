const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')

// [ '_id', 'year', 'make', 'model', 'body_styles' ]

/*
{
	"_id" : ObjectId("5c2ac7c7b1ed030ad9fd5843"),
	"year" : 2008,
	"make" : "Acura",
	"model" : "RL",
	"body_styles" : "[\"Sedan\"]"
}
*/

const model = t => {
    let classes = t.body_styles

    try {
        classes = JSON.parse(classes)
    } catch (error) { }

    if (!classes) {
        classes = []
    }

    return {
        _id: validate.ObjectID(t._id),
        year: validate.number(t.year),
        make: validate.string(t.make, ''),
        model: validate.string(t.model, ''),
        classes,
    }
}

const get = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`vehicles`)

            db.collection(`all_manufactured`).find({}).toArray((err, t) => {
                if (err) { throw err }
                resolve(t.map(model))
            })
        })
    })
}

module.exports = get