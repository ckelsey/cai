const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId
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

const states = {}
const _states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}

Object.keys(_states).forEach(k => states[_states[k].toLowerCase()] = k)

const getUser = (claim, index) => new Promise(resolve => {
    return db.collection(`users`)
        .findOne({ _id: ObjectId.ObjectId(claim.userId) })
        .then(user => {
            if (index % 100 === 0) {
                console.log(`${index}`)
            }

            if (claim.items_laptops === 0 && claim.items_devices === 0 && claim.items_camcorders === 0 && claim.items_power_tools === 0) {
                return resolve(false)
            }

            if (!user.agreement) {
                return resolve(false)
            }

            let purchase_state = user.address.state
            if (!user.address.state || user.address.state === `undefined`) {
                purchase_state = ``
            }

            if (!user.email) {
                user.email = `compliance@classactioninc.com`
            }

            const u = {
                email: user.email,
                fname: user.fname,
                lname: user.lname,
                agreement: !!user.agreement ? toDate(user.agreement) : false,
                source: user.source,
                signupId: user.signupId,
                sourceId: user.sourceId,
                purchase_state
            }

            user.phones.forEach((phone, i) => {
                u[`phone_${i}`] = phone
                u[`phone_${i}_area`] = phone.slice(0, 3)
                u[`phone_${i}_prefix`] = phone.slice(3, 6)
                u[`phone_${i}_suffix`] = phone.slice(6, 10)
            })

            if (!user.address.state || user.address.state === `undefined`) {
                user.address.state = `CA`
            }

            if (!user.address.street || user.address.street === `undefined`) {
                user.address.street = `Suite E, 2777 Alvarado Street`
            }

            if (!user.address.city || user.address.city === `undefined`) {
                user.address.city = `San Leandro`
            }

            if (!user.address.zip || user.address.zip === `undefined`) {
                if (user.address.zipcode && user.address.zipcode !== `undefined`) {
                    user.address.zip = user.address.zipcode
                } else {
                    user.address.zip = `94577`
                }
            }

            if (user.address.state.length > 2) {
                user.address.state = states[user.address.state.toLowerCase()] || `CA`
            }

            u.address_street = user.address.street
            u.address_city = user.address.city
            u.address_state = user.address.state
            u.address_zip = user.address.zip

            return resolve({
                ...claim,
                ...u
            })
        })
})

// S0048_replaced_phone_address.csv
// S0048_has_address
const out = `S0048_purchase_state.json`
const prev = JSON.parse(fs.readFileSync(out))

MongoClient.connect(url, { useNewUrlParser: true })
    .then(connection => {
        db = connection.db(`cai`)
        const claims = JSON.parse(fs.readFileSync(`S0048_claims.json`)).slice(40000, 50000)
        return Promise.all(claims.map(getUser))
    })
    .then(claims => {
        const data = prev.concat(claims.filter(c => !!c))
        console.log(data.length)
        fs.writeFileSync(out, JSON.stringify(data))
        process.exit()
    })