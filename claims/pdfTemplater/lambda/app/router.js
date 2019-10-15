// const project = require('./project')
const query = require('./query')
// const fs = require('fs')
// const path = require('path')

module.exports = (body, url) => {
    switch (url.args[0]) {
        case `project`:
            return project(body, url)
        case `query`:
            return query(body, url)
        // default:
        //     return new Promise((resolve, reject) => {
        //         fs.readFile(path.join(__dirname, url.pathname), (err, buf) => {
        //             if (err) { return reject(err) }
        //             return resolve(buf.toString())
        //         })
        //     })
    }
}