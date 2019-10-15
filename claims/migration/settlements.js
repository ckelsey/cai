const MongoClient = require('mongodb').MongoClient
const url = `mongodb://localhost:27017`
const validate = require('./validate.js')

const modelSettlement = settlement => {
    const timeline = {}
    settlement.settlement_timeline.forEach(v => {
        timeline[validate.string(v.dateName)] = validate.date(v.dateValue)
    })

    const finances = {}
    settlement.settlement_finances.forEach(f => {
        finances[validate.string(f.dataPointName)] = validate.number(f.dataPointValue)
    })

    const model = {
        _id: validate.ObjectID(settlement._id),
        id: validate.settlementId(settlement.settlement_id),
        name: validate.string(settlement.settlement_name),
        shortName: validate.string(settlement.settlement_short_name),
        clientName: validate.string(settlement.settlement_client_name),
        active: validate.binary(settlement.is_active, 0),
        criteria: validate.string(settlement.eligibility_criteria),
        created: validate.date(settlement.createdTS, new Date().getTime()),
        user: validate.ObjectID(settlement.createdUser),
        updated: validate.date(settlement.lastUpdate, new Date().getTime()),
        updatedBy: validate.ObjectID(settlement.lastUpdateUser),
        document: validate.url(settlement.settlement_doc_href),
        metadata: settlement.settlement_doc_metaData,
        CAA_calculations: settlement.CAA_calculations,
        item: validate.string(settlement.item_name),
        items: validate.string(settlement.item_name_plural),
        timeline,
        finances,
    }

    if (!!model._id && !!model.id && !!model.name) {
        return model
    } else {
        throw `invalid model: ${JSON.stringify(model)}`
    }
}

const getSettlements = () => {
    return new Promise(resolve => {
        MongoClient.connect(url, { useNewUrlParser: true }, (err, conn) => {
            if (err) { throw err }

            const db = conn.db(`cai_settlements_claims`)

            db.collection(`settlements`).find({}).toArray((err, settlements) => {
                if (err) { throw err }
                resolve(settlements.map(modelSettlement))
            })
        })
    })
}

module.exports = getSettlements