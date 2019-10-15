const init = require('./query-init')
const get = require('./query-get')

const query = (body, url) => {
    switch (url.args[1]) {
        case `init`:
            return init()
        case `get`:
            return get(body)
    }

    return Promise.reject(`invalid request`)
}

module.exports = query