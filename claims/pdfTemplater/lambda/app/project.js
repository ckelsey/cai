// const newPR = require('./proj-new')
// const savePR = require('./proj-save')
// const openPR = require('./proj-open')
// const exportPR = require('./proj-export')
// const listPR = require('./proj-list')
// const addPagePR = require('./proj-addpage')

const exportPR = require('../lambdaFN/export')

module.exports = (body, url) => {
    return new Promise((resolve, reject) => {

        switch (url.args[1]) {
            case `export`:
                exportPR.handler(body, {}, (error, result) => {
                    return resolve({ error, result })
                })
        }
    })
}