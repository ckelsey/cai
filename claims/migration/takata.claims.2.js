const MongoClient = require('mongodb').MongoClient
const OID = require('mongodb').ObjectID
const url = `mongodb://localhost:27017`
// const { Parser } = require('json2csv')
const fs = require('fs')

MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
    if (err) { throw err }

    const db = conn.db(`cai`)

    db.collection(`claims`).find({ settlement_id: `S0108` }).toArray((err, results) => {
        if (err) { throw err }

        return Promise.all(
            results.map(
                claim => db.collection(`users`).find({ _id: OID(claim.userId) }).toArray()
                    .then(users => {
                        claim.user = users[0]
                        if (!claim.user.agreement) {
                            return false
                        }

                        if (!claim.user.agreement || !claim.user.vehicles || !claim.user.vehicles.length) {
                            return false
                        }
                        // return db.collection(`vinImages`).find({ userId: claim.user.userId }).toArray()
                        //     .then(vinImages => {
                        //         claim.vinImages = vinImages
                        //         return db.collection(`vins`).find({ userId: claim.user.userId }).toArray()
                        //             .then(vins => {
                        //                 claim.vins = vins

                        //                 if (!claim.vins.length || !claim.vinImages.length) {
                        //                     return false
                        //                 }

                        //                 return claim
                        //             })
                        //     })

                        return claim
                    })
            )
        )
            .then(claims => {
                claims = claims.filter(c => !!c)
                // console.log(claims)
                console.log(claims.length)
                fs.writeFileSync(`takata_claims/claims.json`, JSON.stringify(claims))
                process.exit()
            })

    })
})