const fs = require('fs')

module.exports = body => {
    return new Promise((resolve, reject) => {
        const path = `./projects/${body}/project.json`
        const exists = fs.existsSync(path)

        if (exists) {
            resolve(fs.readFileSync(path).toString())
        } else {
            reject(exists)
        }
    })
}