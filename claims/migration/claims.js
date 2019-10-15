const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')

const modelClaim = claim => {
    return {
        settlement_id: claim.settlement_id,
        optOuts: claim.clientOptOuts.map(c => Object.assign({}, c, { settlement_id: claim.settlement_id })),
        settlement: { cost: claim.cost_per_item, emailContent: claim.emailContent },
        claims: claim.clientClaims.map(
            c => {
                const temp = Object.assign({}, c)
                delete temp.user_id
                temp.userId = validate.ObjectID(temp.users_id)
                delete temp.users_id
                temp.created = validate.date(temp.createTS, new Date().getTime())
                delete temp.createTS
                delete temp._id
                delete temp.clientClaimID
                temp.settlement_id = claim.settlement_id
                return temp
            }
        )
    }
}

const getClaims = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`cai_settlements_claims`)

            db.collection(`claims`).find({}).toArray((err, claims) => {
                if (err) { throw err }
                resolve(claims.map(modelClaim))
            })
        })
    })
}

module.exports = getClaims