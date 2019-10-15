var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017'

module.exports = function(id) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, conn) {
            const db = conn.db('cai_settlements_claims')

            db.collection('claims').findOne({ settlement_id: id }, function(err, claims) {
                conn.close()
                if (err) { return reject(err) }
                return resolve(claims && claims.clientClaims ? claims.clientClaims : [])
            })
        })
    })
}