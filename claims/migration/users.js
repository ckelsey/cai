const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')

const modelUser = user => {
    return {
        _id: validate.ObjectID(user._id),
        email: validate.email(user.email_current, ''),
        fname: validate.string(user.fname, ''),
        lname: validate.string(user.lname, ''),
        agreement: validate.date(user.terms_TS),
        source: user.signup_source,
        signupId: user.signup_id,
        userId: user.user_id,
        confirmed: validate.binary(user.email_conf, 0),
        sourceId: user.source_id,
        created: validate.date(user.created_TS, new Date().getTime()),
        updated: validate.date(user.last_update_TS, new Date().getTime()),
        phones: !user.phoneNumbers ? [] : Object.keys(user.phoneNumbers).map(k => validate.phone(user.phoneNumbers[k])).filter(p => !!p),
        address: validate.address(user.address, { street: "", city: "", zip: "", state: "" }),
        password: user.password || '',
        emailMgmt: user.emailMgmt,
        vehicles: user.vehicles
    }
}

const getUsers = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`cai_users`)

            db.collection(`users`).find({}).toArray((err, users) => {
                if (err) { throw err }
                resolve(users.map(modelUser))
            })
        })
    })
}

module.exports = getUsers