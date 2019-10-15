const MongoClient = require('mongodb').MongoClient
const OID = require('mongodb').ObjectID
const saveImageToDisk = require('./dlImage')
const url = `mongodb://localhost:27017`
const { Parser } = require('json2csv')
const fs = require('fs')
const path = require('path')
const dir = `takata_all`
// const existingClaimIdsPath = path.join(dir, `claimIds.json`)
// let existingClaimIds = JSON.parse(fs.readFileSync(existingClaimIdsPath))
const existingClaimIds = []
const claimedVins = []
const invalidClaims = []
const imagesToGet = []

// saveImageToDisk(pic.vinPicURL, `images/pics/${pic._id}${path.extname(pic.vinPicURL)}`)

const yearRange = (start, end) => {
    const arr = []
    while (start <= end) {
        arr.push(start)
        start = start + 1
    }
    return arr
}

const lookUps = {
    Honda: {
        Honda: {
            'Civic 4D': yearRange(2001, 2015),
            'Civic 2D': yearRange(2001, 2015),
            'Accord 4D-L4': yearRange(2001, 2013),
            'Accord 4D-V6': [2001, 2002,].concat(yearRange(2008, 2013)),
            'Accord 2D-L4': [2001, 2002,].concat(yearRange(2008, 2013)),
            'Accord 2D-V6': [2001, 2002,].concat(yearRange(2008, 2013)),
            'Accord Plug-In Hybrid': [2014],
            'CR-V': yearRange(2002, 2016),
            'Accord Crosstour': yearRange(2010, 2015),
            Pilot: yearRange(2003, 2015),
            Odyssey: yearRange(2002, 2004),
            Ridgeline: yearRange(2006, 2014),
            Element: yearRange(2003, 2011),
            Fit: yearRange(2007, 2014),
            Insight: yearRange(2010, 2014),
            'CR-Z': yearRange(2011, 2015),
        },
        Acura: {
            CL: [2003],
            TSX: yearRange(2009, 2014),
            'TSX WGN': yearRange(2011, 2014),
            ILX: yearRange(2013, 2016),
            'MD-X': yearRange(2003, 2006),
            RDX: yearRange(2007, 2017),
            TL: yearRange(2002, 2014),
            TLX: yearRange(2002, 2014),
            RL: yearRange(2005, 2017),
            RLX: yearRange(2005, 2017),
            'ZD-X': yearRange(2010, 2013),
            FCX: yearRange(2010, 2014),
        }
    },
    BMW: {
        BMW: {
            '1 Series': [2006].concat(yearRange(2008, 2013)),
            '2 Series': yearRange(2014, 2017),
            '3 Series': yearRange(2000, 2017),
            '4 Series': yearRange(2014, 2017),
            '5 Series': [2001, 2002, 2003].concat(yearRange(2009, 2013)),
            '6 Series': yearRange(2012, 2017),
            M760Li: [2017],
            X1: yearRange(2011, 2017),
            X3: yearRange(2007, 2017),
            X4: yearRange(2014, 2017),
        }
    },
    Ford: {
        Ford: {
            Edge: yearRange(2007, 2018),
            Fusion: yearRange(2006, 2016),
            GT: yearRange(2005, 2006),
            Mustang: yearRange(2005, 2017),
            Ranger: yearRange(2004, 2011)
        },
        Lincoln: {
            MKC: yearRange(2015, 2016),
            MKX: yearRange(2007, 2018),
            MKZ: yearRange(2007, 2016),
            Zephyr: [2006]
        },
        Mercury: {
            Milan: yearRange(2006, 2011),
        }
    },
    Mazda: {
        Mazda: {
            Mazda2: yearRange(2011, 2014),
            Mazda3: yearRange(2010, 2013),
            Mazda6: yearRange(2003, 2013),
            MazdaSpeed6: yearRange(2006, 2007),
            'CX-7': yearRange(2007, 2015),
            MPV: yearRange(2004, 2006),
            'RX-8': yearRange(2004, 2011),
            'B-Series': yearRange(2004, 2009),
        }
    },
    Nissan: {
        Nissan: {
            Maxima: yearRange(2001, 2003),
            Pathfinder: yearRange(2002, 2004),
            Sentra: yearRange(2002, 2006),
            'Versa Sedan': yearRange(2007, 2017),
            'Versa Hatchback': yearRange(2007, 2012),
            'Versa Note': yearRange(2014, 2017),
            Altima: yearRange(2013, 2017),
            'NV 200': yearRange(2013, 2017),
            NYTaxi: yearRange(2013, 2017),
            '370Z': yearRange(2008, 2018),
            '370Z Roadster': yearRange(2008, 2018),
            Cube: yearRange(2009, 2014),
            NV: yearRange(2010, 2017),
            Armada: yearRange(2013, 2017),
            Titan: yearRange(2013, 2017),
            Rogue: yearRange(2014, 2017),
            Maxima: yearRange(2016, 2017),
        },
        Infiniti: {
            QX30: yearRange(2017, 2018),
            QX56: yearRange(2009, 2017),
            QX80: yearRange(2009, 2017),
            M35: yearRange(2006, 2010),
            M45: yearRange(2006, 2010),
            FX35: yearRange(2003, 2008),
            FX45: yearRange(2003, 2008),
            QX4: yearRange(2002, 2003),
            I30: yearRange(2001, 2004),
            I35: yearRange(2001, 2004),
        }
    },
    Subaru: {
        Subaru: {
            Baja: yearRange(2003, 2006),
            Forester: yearRange(2009, 2013),
            Impreza: yearRange(2004, 2011),
            Legacy: yearRange(2003, 2017),
            Outback: yearRange(2003, 2017),
            BajTribecaa: yearRange(2006, 2014),
            WRX: yearRange(2012, 2014),
            STI: yearRange(2012, 2014),
        },
        Saab: {
            '9-2X': [2005, 2006]
        }
    },
    Toyota: {
        Toyota: {
            Corolla: yearRange(2003, 2017),
            Matrix: yearRange(2003, 2013),
            RAV4: yearRange(2004, 2005),
            Sequoia: yearRange(2002, 2007),
            Sienna: yearRange(2011, 2014),
            Tundra: yearRange(2003, 2006),
            Yaris: yearRange(2006, 2012),
            '4Runner': yearRange(2010, 2017),
            iM: [2017],
        },
        Lexus: {
            ES350: yearRange(2007, 2012),
            GX460: yearRange(2010, 2017),
            IS: yearRange(2006, 2013),
            'IS-F': yearRange(2008, 2014),
            IS250: yearRange(2014, 2015),
            IS350: yearRange(2014, 2015),
            IS250C: yearRange(2010, 2015),
            IS350C: yearRange(2010, 2015),
            IS350: yearRange(2016, 2017),
            IS300: yearRange(2016, 2017),
            IS200T: yearRange(2016, 2017),
            'RC-F': yearRange(2015, 2017),
            'LF-A': [2012],
            '350T': yearRange(2015, 2017),
            '300T': yearRange(2015, 2017),
            '200T': yearRange(2015, 2017),
            SC430: yearRange(2002, 2010),
        },
        Scion: {
            iM: [2017],
            XB: yearRange(2008, 2015),
        }
    }
}

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

MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
    if (err) { throw err }

    const db = conn.db(`cai`)
    const claims = {}
    let found = 0
    let claimIds = []

    return db.collection(`claims`).find({ settlement_id: `S0108` }, { clientClaims: true }).toArray()
        .then(results => {
            return Promise.all(results.map(
                c => existingClaimIds.indexOf(c._id.toString()) > -1 ? Promise.resolve(false) : db.collection(`users`).find({ _id: OID(c.userId) }).toArray()
                    .then(u => {
                        if (!u[0].agreement || !u[0].vehicles || !u[0].vehicles.length) {
                            return false
                        }

                        c.user = u[0]

                        return Promise.all(
                            c.user.vehicles.map((v, i) => db.collection(`vins`).findOne({ VIN: v.VIN })
                                .then(vin => {
                                    c.user.vehicles[i].vin = vin
                                    return c.user.vehicles[i]
                                })
                            )
                        )
                            .then(vehicles => {
                                c.user.vehicleVins = vehicles
                                return c
                            })
                            .then(() => db.collection(`vinImages`).find({ userId: c.user.userId }).toArray()
                                .then(imgs => {
                                    c.user.vinImages = imgs.map(img => img.url).filter(img => !!img)
                                    return c
                                })
                            )
                    })
            ))
        })
        .then(results => {
            Object.keys(lookUps).forEach(suit => {
                Object.keys(lookUps[suit]).forEach(make => {
                    Object.keys(lookUps[suit][make]).forEach(model => {
                        results.forEach(c => {
                            if (!c || !c.user) { return }

                            c.user.vehicleVins.forEach(vehicle => {
                                if (!vehicle.make || !vehicle.model) { return }
                                if (vehicle.make.toLowerCase() !== make.toLowerCase()) { return }
                                if (model.toLowerCase() !== vehicle.model.toLowerCase()) { return }
                                if (lookUps[suit][make][model].indexOf(vehicle.year) === -1) { return }

                                if (!claims[suit]) { claims[suit] = {} }
                                if (!claims[suit][make]) { claims[suit][make] = {} }
                                if (!claims[suit][make][model]) { claims[suit][make][model] = {} }
                                if (!claims[suit][make][model][vehicle.year]) { claims[suit][make][model][vehicle.year] = [] }

                                const user = Object.assign({}, c.user)
                                const res = Object.assign({}, c, { user }, { vehicle })
                                res.vehicle.claimIdentifier = `${make}_${model}_${vehicle.year}`
                                claims[suit][make][model][vehicle.year].push(res)
                                found = found + 1
                            })
                        })
                    })
                })
            })

            Object.keys(claims).forEach(suit => {
                const suitClaims = []

                Object.keys(claims[suit]).forEach(make => {
                    Object.keys(claims[suit][make]).forEach(model => {
                        Object.keys(claims[suit][make][model]).forEach(year => {
                            claims[suit][make][model][year].forEach(c => {

                                if (!c.vehicle.VIN || !c.vehicle.year || !c.vehicle.make || !c.vehicle.model) {
                                    console.log(c.vehicle)
                                }

                                const res = {
                                    claimId: c._id,
                                    filed: toDate(c.created),
                                    userId: c.user.userId,
                                    userCreated: toDate(c.user.created),
                                    VIN: c.vehicle.VIN,
                                    year: c.vehicle.year,
                                    make: c.vehicle.make,
                                    model: c.vehicle.model,
                                    class: c.vehicle.class,
                                    email: c.user.email,
                                    fname: c.user.fname,
                                    lname: c.user.lname,
                                    name: `${c.user.fname} ${c.user.lname}`,
                                    agreement_date: toDate(c.user.agreement),
                                    rental: c.rental || 0,
                                    towing: c.towing || 0,
                                    childCare: c.childCare || 0,
                                    repair: c.repair || 0,
                                    wages: c.wages || 0,
                                    storage: c.storage || 0,
                                    transport: c.transport || 0,
                                    other: c.other || 0,
                                    otherDesc: c.additionalInfo
                                }

                                c.user.vinImages.forEach((img, imgI) => {
                                    const name = img.replace(`/`, `_`)
                                    imagesToGet.push([name, img])
                                    res[`vinImage${imgI + 1}`] = name
                                })

                                const qualifications = c.claimQualificationData && c.claimQualificationData.questionResponses.length ? c.claimQualificationData.questionResponses : c.qualificationData.questionResponses

                                if (qualifications.length) {
                                    qualifications.forEach(q => {
                                        res[q.name] = q.value === 1 || q.value === `1` || q.value === `Yes` ? `x` : ``
                                    })
                                }

                                if (!c.user.phones[0]) {
                                    c.user.phones.push(`4153732386`)
                                }

                                c.user.phones.forEach((phone, i) => {
                                    res[`phone_${i}`] = phone
                                    res[`phone_${i}_area`] = phone.slice(0, 3)
                                    res[`phone_${i}_prefix`] = phone.slice(3, 6)
                                    res[`phone_${i}_suffix`] = phone.slice(6, 10)
                                })

                                formatAddress(c.user, res)

                                res[c.vehicle.claimIdentifier] = `x`
                                suitClaims.push(res)
                                claimIds.push(c._id)
                            })
                        })
                    })
                })

                const csvDir = path.join(dir, suit)
                try {
                    fs.mkdirSync(csvDir, { recursive: true })
                } catch (error) { }


                const fields = []
                suitClaims.forEach(claim => Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined))

                const opts = { fields, flatten: true }

                try {
                    const parser = new Parser(opts)
                    const csv = parser.parse(suitClaims)
                    fs.writeFileSync(path.join(csvDir, `${suit}.csv`), csv)
                } catch (err) {
                    console.error(err)
                }
            })

            console.log(found)
            console.log(claimIds.length)
            // console.log(existingClaimIds.length)
            // existingClaimIds = existingClaimIds.concat(claimIds)
            // fs.writeFileSync(existingClaimIdsPath, JSON.stringify(existingClaimIds))
            fs.writeFileSync(path.join(dir, `claims.json`), JSON.stringify(claims))
            process.exit()
        })
        .catch(err => {
            console.log(err)
            process.exit()
        })
})