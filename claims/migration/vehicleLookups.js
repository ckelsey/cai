const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')
const saveImageToDisk = require('./dlImage')
var path = require('path')

// [ '_id', 'vehicle', 'user_id', 'picHref', 'createTS', 'confirmed' ]

/*

"_id" : ObjectId("5c56ed701ddd4899b264e937"),
	"vehicle" : {
		"_id" : ObjectId("5c56ed701ddd4899b264e936"),
		"VIN" : "5N1AR2MN1FC700995",
		"nhtsaResponse" : "0 - VIN decoded clean. Check Digit (9th position) is correct",
		"year" : 2015,
		"make" : "NISSAN",
		"model" : "Pathfinder",
		"bodyClass" : "Crossover Utility Vehicle (CUV)"
	},
	"user_id" : "729040312",
	"picHref" : "https://storage.googleapis.com/media.helloumi.com/customers/7290517/0.jpg",
	"createTS" : ISODate("2019-02-03T13:32:32.068Z"),
    "confirmed" : NumberLong(0)
    
    */

const valOf = val => {
    try {
        val = val.valueOf()
    } catch (error) { }

    return parseInt(val)
}

const modelPic = pic => {

    // if (!!pic.picHref) {
    //     saveImageToDisk(pic.picHref, `images/lookups/${pic._id}${path.extname(pic.picHref)}`)
    // }

    return {
        _id: validate.ObjectID(pic._id),
        userId: pic.user_id,
        url: validate.string(pic.picHref, ''),
        confirmed: pic.confirmed ? valOf(pic.confirmed) : 0,
        created: validate.date(pic.createTS, new Date().getTime()),
        vehicleId: validate.ObjectID(pic.vehicle._id),
        VIN: validate.string(pic.vehicle.VIN, ''),
        notes: validate.string(pic.vehicle.nhtsaResponse, ''),
        year: validate.number(pic.vehicle.year),
        make: validate.string(pic.vehicle.make, ''),
        model: validate.string(pic.vehicle.model, ''),
        class: validate.string(pic.vehicle.bodyClass, ''),
    }
}

const get = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`vehicles`)

            db.collection(`vin_pic_lookups`).find({}).toArray((err, pics) => {
                if (err) { throw err }
                resolve(pics.map(modelPic))
            })
        })
    })
}

module.exports = get