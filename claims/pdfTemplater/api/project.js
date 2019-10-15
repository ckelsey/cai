const newPR = require('./proj-new')
const savePR = require('./proj-save')
const openPR = require('./proj-open')
const exportPR = require('./proj-export')
const listPR = require('./proj-list')
const addPagePR = require('./proj-addpage')

module.exports = (body, url) => {
    switch (url.args[1]) {
        case `new`:
            return newPR(body, url.args[1])
        case `save`:
            return savePR(body.toString())
        case `open`:
            return openPR(body.toString())
        case `export`:
            return exportPR(body.toString())
        case `list`:
            return listPR()
        case `addpage`:
            return addPagePR(body, url.args[2])
    }
}