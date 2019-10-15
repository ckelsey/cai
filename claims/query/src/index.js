const fs = require('fs')
const path = require('path')
const { Parser } = require('json2csv')

const getSettlement = require('./getSettlement')
const getClaims = require('./getClaims')
const getClaimsUsers = require('./getClaimUsers')
const processClaims = require('./processClaims')

let Claims = []
let Users = {}

if (!process.env.DIR) {
    throw new Error('DIR variable is required for output path')
}

const custom = require(path.join(__dirname, process.env.DIR, `custom.js`))
const settlementData = custom.settlement()

function chunkArray(claims) {
    const c = claims.slice()
    const result = []

    while (c.length) {
        result.push(c.splice(0, 1000))
    }

    return result
}

function createDir() {
    return new Promise(resolve => {
        try {
            fs.mkdir(process.env.DIR, { recursive: true }, err => {
                if (err) { throw err }
                return resolve()
            })
        } catch (error) {
            throw error
        }
    })
}

function renderChunk(claims, settlement, custom) {
    return new Promise(resolve => {
        return getClaimsUsers(claims)
            .then(users => {
                console.log(Object.keys(users).length, 'users received')
                const result = processClaims(claims, users, settlement, custom)
                console.log(result.length, 'proccessed claims')
                return resolve(result)
            })
    })
}

function run() {
    let settlement

    return createDir()
        .then(() => getSettlement(settlementData.id))
        .then(s => {

            settlement = Object.assign({}, s, settlementData)

            console.log('settlementData retrieved')

            return getClaims(settlement.id)
        })
        .then(claims => {
            /** Have to split the process as it will almost certainly run out of memory */

            const Chunks = chunkArray(claims)
            let processed = []

            console.log(claims.length, 'claims retrieved', Chunks.length, 'chunks')

            return new Promise(resolve => {
                const cycle = () => {
                    if (!Chunks.length) { return resolve(processed) }

                    return renderChunk(Chunks.pop(), settlement, custom)
                        .then(result => {
                            processed = processed.concat(result)
                            return cycle()
                        })
                }

                return cycle()
            })

        })
        .then(processed => {
                const jsonToWrite = JSON.stringify(processed)
                const jsonPath = path.join(__dirname, process.env.DIR, `${settlementData.id}_claims.json`)
                const csvToWrite = new Parser(Object.keys(processed[0])).parse(processed)
                const csvPath = path.join(__dirname, process.env.DIR, `${settlementData.id}_claims.csv`)

                fs.writeFile(jsonPath, jsonToWrite,
                        err => {
                            if (err) { throw err }
                            console.log(`Wrote ${jsonPath}`)
                    
                    fs.writeFile(csvPath, csvToWrite,
                        err => {
                            if (err) { throw err }
                            console.log(`Wrote ${csvPath}`)
                            return process.exit()
                        }
                    )
                }
            )
        })
        .catch(err => {
            console.log(err)
            process.exit()
        })
}

run()