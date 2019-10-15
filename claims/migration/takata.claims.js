const MongoClient = require('mongodb').MongoClient
const OID = require('mongodb').ObjectID
const url = `mongodb://localhost:27017`
const { Parser } = require('json2csv')
const fs = require('fs')

const settlementId = `S0108`
const lookUps = {
    // BMW: [`1 Series`, `2 Series`, `3 Series`, `4 Series`, `5 Series`, `6 Series`, `M760Li`, `X1`, `X3`, `X4`],
    // Subaru: [`Baja`, `Forester`, `Impreza`, `Legacy`, `Outback`, `Tribeca`, `WRX/STI`],
    // Saab: [`9-2X`]
    // Nissan: [`Maxima`, `Pathfinder`, `Sentra`, `Versa Sedan`, `Versa Hatchback`, `Altima`, `Versa Note`, `NV 200`, `NYTaxi`],
    // Infiniti: [`I30/I35`, `QX4`, ` FX35/45`, ` M35/45`, `QX56/QX80`],
    // Mazda: [`Mazda2`, `Mazda3`, `Mazda6`, `MazdaSpeed6`, `CX-7`, `CX-9`, `MPV`, `RX-8`, `B-Series`]
    // Honda: [`Pilot`, `Odyssey`, `Ridgeline`, `Element`, `Fit`, `Insight`, `CR-Z`],
    // Acura: [`CL`, `TSX`, `ILX`, `MD-X`, `RDX`, `TL/TLX`, `RL/RL-X`, `ZD-X`, `FCX`]
    Ford: [`Edge`, `Fusion`, `GT`, `Mustang`, `Ranger`],
    // Lincoln: [`MKC`, `MKX`, `MKZ`, `Zephyr`],
    // Mercury: [`Milan`]
    // Toyota: [`Corolla`, `Matrix`, `RAV4`, `Sequoia`, `Sienna`, `Tundra`, `Yaris`, `4Runner`, `iM`,],
    // Lexus: [`ES350`, `GX460`, `IS`, ` IS-F`, `IS250/350`, `IS250C/350C`, `IS350/300/200T`]
}

let start = 2014
let end = 2017
const years = []
while (start <= end) {
    years.push(start)
    start = start + 1
}

// const years = [2002, 2003, 2009, 2010, 2011, 2012, 2013, 2014]

const m = Object.keys(lookUps)[0]

years.forEach(Year => {
    const suit = `ford`
    const make = m.toLowerCase() //`bmw`
    const model = lookUps[m][0].toLowerCase()
    const fileName = `takata_claims/${suit}/takata_${make}_${model}_${Year}.csv`
    // const query = { make: new RegExp(`^${make}$`, `i`), model: model, year: Year, class: /hatchback/i }
    const query = { make: new RegExp(`^${make}$`, `i`), model: new RegExp(`^${model}`, `i`), year: Year }

    console.log(suit, make, model, fileName)

    const states = { "alabama": "AL", "alaska": "AK", "american samoa": "AS", "arizona": "AZ", "arkansas": "AR", "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE", "district of columbia": "DC", "federated states of micronesia": "FM", "florida": "FL", "georgia": "GA", "guam": "GU", "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "marshall islands": "MH", "maryland": "MD", "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", "northern mariana islands": "MP", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "palau": "PW", "pennsylvania": "PA", "puerto rico": "PR", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT", "virgin islands": "VI", "virginia": "VA", "washington": "WA", "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY" }

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

    const formatAddress = (user, data) => {
        if (!user.address.state || user.address.state === `undefined`) {
            user.address.state = `CA`
        }

        if (user.address.state.length > 2) {
            user.address.state = states[user.address.state.toLowerCase()] || `CA`
        }

        data.address_state = user.address.state

        if (!user.address.street || user.address.street === `undefined`) {
            user.address.street = `Suite E, 2777 Alvarado Street`
        }

        data.address_street = user.address.street

        if (!user.address.city || user.address.city === `undefined`) {
            user.address.city = `San Leandro`
        }

        data.address_city = user.address.city

        if (!user.address.zip || user.address.zip === `undefined`) {
            if (user.address.zipcode && user.address.zipcode !== `undefined`) {
                user.address.zip = user.address.zipcode
            } else {
                user.address.zip = `94577`
            }
        }

        data.address_zip = user.address.zip
        data.address_country = `United States of America`

        return data
    }

    const getData = (db, data) => new Promise(resolve => {
        let images
        let users
        let claims

        // console.log(`data.userId`, data.userId)

        const finish = () => {
            if (!!users && !!images && !!claims) {
                return resolve({ images, users, claims })
            }
        }

        db.collection(`vinImages`).find({ userId: data.userId }).toArray()
            .then(imgs => {
                images = imgs || []
                finish()
            })

        db.collection(`users`).find({ userId: data.userId }).toArray()
            .then(u => {
                console.log(u[0]._id)
                return db.collection(`claims`).find({ userId: OID(u[0]._id), settlement_id: settlementId }).toArray()
                    .then(c => {
                        users = u || []
                        claims = c || []
                        finish()
                    })
            })

    })

    MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
        if (err) { throw err }

        const db = conn.db(`cai`)

        db.collection(`vins`).find(query).toArray((err, results) => {
            if (err) { throw err }

            const fields = []

            const completed = []

            const writeCsv = () => {
                const claims = completed.filter(c => !!c)

                if (!claims.length) {
                    return process.exit()
                }

                claims.forEach(claim => Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined))

                const opts = { fields, flatten: true }

                try {
                    const parser = new Parser(opts)
                    const csv = parser.parse(claims)
                    fs.writeFileSync(fileName, csv)
                    process.exit()
                } catch (err) {
                    console.error(err)
                    process.exit()
                }

                return true
            }

            const ifDone = () => {
                // if (completed.length % 100 === 0) {
                //     console.log(`${completed.length}/${results.length}`)
                // }

                if (completed.length === results.length) {
                    return writeCsv()
                }

                return false
            }

            if (!results.length) {
                return process.exit()
            }

            results.forEach(
                data => getData(db, data)
                    .then(UsersImages => {
                        console.log(data)


                        if (!UsersImages.users[0] || !UsersImages.users[0].agreement) {
                            completed.push(false)
                            return ifDone()
                        }
                        data[`email`] = UsersImages.users[0].email || `compliance@classactioninc.com`
                        data[`fname`] = UsersImages.users[0].fname
                        data[`lname`] = UsersImages.users[0].lname
                        data[`name`] = `${UsersImages.users[0].fname} ${UsersImages.users[0].lname}`
                        data[`agreement_date`] = toDate(UsersImages.users[0].agreement)
                        data[`user_created`] = toDate(UsersImages.users[0].created)

                        if (!UsersImages.users[0].phones[0]) {
                            UsersImages.users[0].phones.push(`4153732386`)
                        }

                        UsersImages.users[0].phones.forEach((phone, i) => {
                            data[`phone_${i}`] = phone
                            data[`phone_${i}_area`] = phone.slice(0, 3)
                            data[`phone_${i}_prefix`] = phone.slice(3, 6)
                            data[`phone_${i}_suffix`] = phone.slice(6, 10)
                        })

                        formatAddress(UsersImages.users[0], data)

                        UsersImages.images.forEach((img, i) => {
                            data[`vinImage_${i}_id`] = img._id
                            data[`vinImage_${i}_url`] = img.url
                            data[`vinImage_${i}_status`] = img.status
                        })

                        UsersImages.claims.forEach((claim, i) => {
                            Object.keys(claim.claimData).forEach(cdKey => {
                                const parts = claim.claimData[claim.claimData].split(`.`)
                                data[`claim_${i}_${cdKey}_dollars`] = parts[0] || 0
                                data[`claim_${i}_${cdKey}_cents`] = `00${parts[1] || 0}`.slice(-2)
                            })

                            claim.claimQualificationData.questionResponses.forEach(q => {
                                data[`claim_${i}_${q.name}`] = q.value
                            })

                            data[`claim_${i}_filed`] = toDate(claim.created)
                        })

                        completed.push(data)
                        return ifDone()
                    })
            )
        })
    })
})
