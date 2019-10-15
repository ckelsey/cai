var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017'

module.exports = function(claims) {
    const userIds = claims.map(claim => claim.user_id)
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, conn) {
            const db = conn.db('cai_users')

            db.collection('users').find({ user_id: { $in: userIds } }).toArray((err, users) => {
                if (err) { return reject(err) }

                const result = {}

                users.forEach(user => result[user.user_id] = user)

                return resolve(result)
            })
        })
    })
}