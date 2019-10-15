const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`

let db

const toDate = ts => {
    var d = new Date(ts)
    const month = `0${d.getMonth() + 1}`.slice(-2)
    const day = `0${d.getDate()}`.slice(-2)
    const year = d.getFullYear()
    const hours = d.getHours()
    const hour = `0${hours > 12 ? hours - 12 : hours}`.slice(-2)
    const minute = `0${d.getMinutes()}`.slice(-2)
    const amPm = hours >= 12 ? `pm` : `am`
    return `${month}/${day}/${year} ${hour}:${minute}${amPm}`
}

const getUser = claim => new Promise(resolve => {
    return db.collection(`users`)
        .find({ _id: claim.userId }).toArray()
        .then(users => {
            return resolve({ ...claim, user: users[0] })
        })
})

const getClaims = settlement => new Promise(resolve => {
    return db.collection(`claims`)
        .find({ settlement_id: settlement.id }).toArray()
        .then(claims => {
            console.log(`claims:`, claims.length)

            // return Promise.all(claims.map(getUser))

            claims = claims.map(claim => {
                return {
                    recipient: claim.recipient,
                    items_laptops: claim.claimData.laptops,
                    items_devices: claim.claimData.consumerDevices,
                    items_camcorders: claim.claimData.camcorders,
                    items_power_tools: claim.claimData.powerTools,
                    userId: claim.userId,
                    filed: toDate(claim.created),
                    settlement_id: settlement.id,
                    settlement_name: settlement.name
                }
            })

            return resolve(claims)
        })
    // .then(claims => {
    //     console.log(`claims and users:`, claims.length)
    // })
})

MongoClient.connect(url, { useNewUrlParser: true })
    .then(connection => {
        db = connection.db(`cai`)
        return db.collection(`settlements`).find({ id: `S0048` }).toArray()
    })
    .then(settlements => {
        settlement = settlements[0]
        return getClaims(settlement)
    })
    .then(claims => {
        fs.writeFileSync(`S0048_claims.json`, JSON.stringify(claims))
        return process.exit()
    })