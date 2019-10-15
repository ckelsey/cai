const fs = require('fs')
const path = require('path')

module.exports = () => {
    return new Promise((resolve, reject) => {
        fs.readdir(`./projects/`, { withFileTypes: true }, (err, files) => {
            if (err) { return reject(err) }
            return resolve(
                files
                .filter(dir => {
                    if (!dir.isDirectory()) { return false }
                    return fs.existsSync(path.resolve(`./projects/${dir.name}/project.json`))
                })
                .map(dir => ({
                    updated: parseInt(fs.statSync(path.resolve(`./projects/${dir.name}/project.json`)).ctimeMs),
                    name: dir.name
                }))
            )
        })
    })
}