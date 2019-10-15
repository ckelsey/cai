const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')
const saveImageToDisk = require('./dlImage')
var path = require('path')

//[ '_id', 'user_id', 'vinPicURL', 'statusCode' ]

const valOf = val => {
    try {
        val = val.valueOf()
    } catch (error) { }

    return parseInt(val)
}

const modelPic = pic => {
    // if (!!pic.vinPicURL) {
    //     saveImageToDisk(pic.vinPicURL, `images/pics/${pic._id}${path.extname(pic.vinPicURL)}`)
    // }

    return {
        _id: validate.ObjectID(pic._id),
        userId: pic.user_id,
        url: validate.string(pic.vinPicURL, ''),
        status: pic.statusCode ? valOf(pic.statusCode) : 0
    }
}

const getPicData = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`vehicles`)

            db.collection(`vin_pic_support`).find({}).toArray((err, pics) => {
                if (err) { throw err }
                resolve(pics.map(modelPic))
            })
        })
    })
}

module.exports = getPicData