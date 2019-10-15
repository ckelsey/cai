const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const url = `mongodb://localhost:27017`
const getSettlements = require('./settlements')
const getClaims = require('./claims')
const getUsers = require('./users')
const vehiclePics = require('./vehiclePics')
const vins = require('./vehicleLookups')
const takata = require('./takata_eligible')
const autos = require('./all_manufactured')

let db

MongoClient.connect(url, { useNewUrlParser: true })
    .then(conn => {
        db = conn.db(`cai`)
        console.log(`connected`)
        return db.dropDatabase()
    })
    .then(getSettlements)
    .then(settlements => {
        console.log(`settlements:`, settlements.length)
        return db.collection(`settlements`).insertMany(settlements)
    })
    .then(getClaims)
    .then(claims => {
        console.log(`claims objects:`, claims.length)
        let claimsToDo = []
        let settlementsToDo = []

        claims.map(claim => {
            console.log(`claims:`, claim.claims.length)
            claimsToDo = claimsToDo.concat(claim.claims)
            settlementsToDo = settlementsToDo.concat({ id: claim.settlement_id, record: claim.settlement })
        })

        return Promise.all(
            [db.collection(`claims`).insertMany(claimsToDo)]
                .concat(
                    settlementsToDo.map(obj => {
                        return db.collection(`settlements`).updateOne({ id: obj.id }, { $set: obj.record })
                    })
                )
        )
    })
    .then(getUsers)
    .then(u => {
        console.log(`users:`, u.length)
        return db.collection(`users`).insertMany(u)
    })
    .then(vehiclePics)
    .then(u => {
        console.log(`vehiclePics:`, u.length)
        return db.collection(`vinImages`).insertMany(u)
    })
    .then(vins)
    .then(u => {
        console.log(`vins:`, u.length)
        return db.collection(`vins`).insertMany(u)
    })
    .then(takata)
    .then(u => {
        console.log(`takata:`, u.length)
        return db.collection(`takata`).insertMany(u)
    })
    .then(autos)
    .then(u => {
        console.log(`autos:`, u.length)
        return db.collection(`autos`).insertMany(u)
    })
    .then(() => {
        // console.log(r)
        console.log(`DONE`)
        // process.exit()
    })
    .catch(err => {
        console.log(err)
        // process.exit()
    })