const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const { Parser } = require('json2csv')
const fs = require('fs')

const getData = (db, data) => new Promise(resolve => {
    let images
    let users

    const finish = () => {
        if (!!users && !!images) {
            return resolve({ images, users })
        }
    }

    db.collection(`vinImages`).find({ userId: data.userId }).toArray()
        .then(imgs => {
            images = imgs || []
            finish()
        })

    db.collection(`users`).find({ userId: data.userId }).toArray()
        .then(u => {
            users = u || []
            finish()
        })
})

MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
    if (err) { throw err }

    const db = conn.db(`cai`)

    db.collection(`vins`).find({}).toArray((err, results) => {
        if (err) { throw err }

        const fields = []

        console.log(results.length)

        const completed = []

        const writeCsv = () => {
            console.log(completed[0])
            console.log(completed.length)

            const claims = completed.filter(c => !!c)

            claims.forEach(claim => Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined))

            const opts = { fields, flatten: true }

            try {
                const parser = new Parser(opts)
                const csv = parser.parse(claims)
                fs.writeFileSync(`vin_users.csv`, csv)
                process.exit()
            } catch (err) {
                console.error(err)
                process.exit()
            }

            return true
        }

        const ifDone = () => {
            if (completed.length % 100 === 0) {
                console.log(`${completed.length}/${results.length}`)
            }

            if (completed.length === results.length) {
                return writeCsv()
            }

            return false
        }

        results.forEach(
            data => getData(db, data)
                .then(UsersImages => {
                    UsersImages.images.forEach((img, i) => {
                        data[`vinImage_${i}_id`] = img._id
                        data[`vinImage_${i}_url`] = img.url
                        data[`vinImage_${i}_status`] = img.status
                    })

                    if (UsersImages.users[0]) {
                        data[`user_db_id`] = UsersImages.users[0]._id
                        data[`email`] = UsersImages.users[0].email
                        data[`fname`] = UsersImages.users[0].fname
                        data[`lname`] = UsersImages.users[0].lname
                        data[`agreement_date`] = UsersImages.users[0].agreement
                        data[`user_source`] = UsersImages.users[0].source
                        data[`signupId`] = UsersImages.users[0].signupId
                        data[`user_confirmed`] = UsersImages.users[0].confirmed
                        data[`user_sourceId`] = UsersImages.users[0].sourceId
                        data[`user_created`] = UsersImages.users[0].created
                        data[`user_updated`] = UsersImages.users[0].updated
                        UsersImages.users[0].phones.forEach((phone, pi) => data[`phone`] = UsersImages.users[0].phones[pi])
                        data[`user_address_street`] = UsersImages.users[0].address.street
                        data[`user_address_city`] = UsersImages.users[0].address.city
                        data[`user_address_state`] = UsersImages.users[0].address.state
                        data[`user_address_zip`] = UsersImages.users[0].address.zip
                        data[`sendGrid_recipientID`] = UsersImages.users[0].emailMgmt.sendGrid_recipientID
                        data[`sendGrid_createTS`] = UsersImages.users[0].emailMgmt.sendGrid_createTS
                        data[`unsubscribed_ind`] = UsersImages.users[0].emailMgmt.unsubscribed_ind
                        data[`spam_ind`] = UsersImages.users[0].emailMgmt.spam_ind
                    } else {
                        completed.push(false)
                        return ifDone()
                    }


                    completed.push(data)
                    return ifDone()
                })

        )
        // .then(claims => {
        //     console.log(`qwerty`)
        //     console.log(claims)
        // })







    })
})

// claims.forEach(claim => Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined))
                // const opts = { fields, flatten: true }

                // try {
                //     const parser = new Parser(opts)
                //     const csv = parser.parse(claims)
                //     fs.writeFileSync(`vin_users.csv`, csv)
                //     process.exit()
                // } catch (err) {
                //     console.error(err)
                //     process.exit()
                // }




// .then(datas => {
                //     console.log(datas[0])
                //     datas[0].forEach((img, i) => {
                //         data[`vinImage_${i}_id`] = img._id
                //         data[`vinImage_${i}_url`] = img.url
                //         data[`vinImage_${i}_status`] = img.status
                //     })

                //     data[`user_db_id`] = datas[1]._id
                //     data[`email`] = datas[1].email
                //     data[`fname`] = datas[1].fname
                //     data[`lname`] = datas[1].lname
                //     data[`agreement_date`] = datas[1].agreement
                //     data[`user_source`] = datas[1].source
                //     data[`signupId`] = datas[1].signupId
                //     data[`user_confirmed`] = datas[1].confirmed
                //     data[`user_sourceId`] = datas[1].sourceId
                //     data[`user_created`] = datas[1].created
                //     data[`user_updated`] = datas[1].updated

                //     datas[1].phones.forEach((phone, pi) => data[`phone`] = datas[1].phones[pi])

                //     data[`user_address_street`] = datas[1].address.street
                //     data[`user_address_city`] = datas[1].address.city
                //     data[`user_address_state`] = datas[1].address.state
                //     data[`user_address_zip`] = datas[1].address.zip
                //     data[`sendGrid_recipientID`] = datas[1].emailMgmt.sendGrid_recipientID
                //     data[`sendGrid_createTS`] = datas[1].emailMgmt.sendGrid_createTS
                //     data[`unsubscribed_ind`] = datas[1].emailMgmt.unsubscribed_ind
                //     data[`spam_ind`] = datas[1].emailMgmt.spam_ind
                //     console.log(`${index}/${results.length}`)
                //     return data
                // })







 // return Promise.all(
        //     d.map((_d, di) => new Promise(resolve => db.collection(`vinImages`).find({ userId: _d.userId }).toArray((err, imgs) => {
        //         if (err) { throw err }

        //         imgs.forEach((img, i) => {
        //             _d[`vinImage_${i}_id`] = img._id
        //             _d[`vinImage_${i}_url`] = img.url
        //             _d[`vinImage_${i}_status`] = img.status
        //         })

        //         console.log(`${di}/${d.length}`)

        //         return resolve(_d)
        //     })))
        // )
        //     .then(vins => {
        //         console.log(vins)
        //         Promise.all(
        //             vins.map(
        //                 vin => db.collection(`users`)
        //                     .find({ signupId: vin.userId })
        //                     .toArray((err, users) => {
        //                         if (err) { throw err }

        //                         vin[`user_db_id`] = users[0]._id
        //                         vin[`email`] = users[0].email
        //                         vin[`fname`] = users[0].fname
        //                         vin[`lname`] = users[0].lname
        //                         vin[`agreement_date`] = users[0].agreement
        //                         vin[`user_source`] = users[0].source
        //                         vin[`signupId`] = users[0].signupId
        //                         vin[`user_confirmed`] = users[0].confirmed
        //                         vin[`user_sourceId`] = users[0].sourceId
        //                         vin[`user_created`] = users[0].created
        //                         vin[`user_updated`] = users[0].updated

        //                         users[0].phones.forEach((phone, i) => vin[`phone`] = users[0].phones[i])

        //                         vin[`user_address_street`] = users[0].address.street
        //                         vin[`user_address_city`] = users[0].address.city
        //                         vin[`user_address_state`] = users[0].address.state
        //                         vin[`user_address_zip`] = users[0].address.zip
        //                         vin[`sendGrid_recipientID`] = users[0].emailMgmt.sendGrid_recipientID
        //                         vin[`sendGrid_createTS`] = users[0].emailMgmt.sendGrid_createTS
        //                         vin[`unsubscribed_ind`] = users[0].emailMgmt.unsubscribed_ind
        //                         vin[`spam_ind`] = users[0].emailMgmt.spam_ind

        //                         return vin
        //                     })
        //             )
        //         )
        //     })
        //     .then(claims => {
        //         claims.forEach(claim => Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined))
        //         const opts = { fields, flatten: true }

        //         try {
        //             const parser = new Parser(opts)
        //             const csv = parser.parse(claims)
        //             fs.writeFileSync(`vin_users.csv`, csv)
        //             process.exit()
        //         } catch (err) {
        //             console.error(err)
        //             process.exit()
        //         }
        //     })