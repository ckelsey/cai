const mongodb = require('mongodb')
const zips = require('./zipcodeData.json')

const methods = {
    logs: [],
    ObjectID: id => {
        if (!mongodb.ObjectID.isValid(id)) {
            methods.logs.push(`invalid ID ${id}`)
            new mongodb.ObjectID()
        } else {
            return mongodb.ObjectID(id)
        }
    },

    settlementId: (id, emptyVal) => {
        if (!id) {
            methods.logs.push(`no settlementId`)
            return emptyVal
        }
        if (typeof id !== `string`) {
            methods.logs.push(`${id} settlementId is invalid id`)
            return emptyVal
        }
        if (id.length < 5) {
            methods.logs.push(`${id} settlementId length is less than 5`)
            return emptyVal
        }
        if (id[0] !== `S`) {
            methods.logs.push(`${id} settlementId is invalid`)
            return emptyVal
        }
        if (id.match(/\d+/).length === 4) {
            methods.logs.push(`${id} settlementId is invalid`)
            return emptyVal
        }
        return id
    },

    string: (str, emptyVal) => {
        if (!!str && str !== ``) {
            if (typeof str !== `string`) {
                methods.logs.push(`expected string, got ${typeof str}`)
                return emptyVal
            }

            return str
        }

        methods.logs.push(`empty string`)
        return emptyVal
    },

    binary: (num, emptyVal) => {
        num = parseInt(num)
        if (num !== 0 && num !== 1) {
            methods.logs.push(`${num} does not equal 1 or 0`)
            return emptyVal
        }
        return num
    },

    date: (d, emptyVal) => {
        if (!d) {
            methods.logs.push(`${d} invalid date`)
            return emptyVal
        }
        try { d = d.toJSON() } catch (error) { }
        if (typeof d !== 'string') { try { d = d.toISOString() } catch (error) { } }
        if (typeof d !== `string`) {
            methods.logs.push(`${d} invalid date`)
            return emptyVal
        }
        return new Date(d).getTime()
    },

    url: (u, emptyVal) => {
        const asString = methods.string(u)
        if (!asString || asString === ``) {
            methods.logs.push(`${u} invalid url`)
            return emptyVal
        }

        regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        if (regexp.test(u)) {
            return u
        } else {
            methods.logs.push(`${u} invalid url`)
            return emptyVal
        }
    },

    array: (a, emptyVal) => {
        if (Array.isArray(a)) {
            return a
        }
        methods.logs.push(`expected array, got ${typeof a}`)
        return emptyVal
    },

    number: (num, emptyVal) => {
        num = parseFloat(num)

        if (isNaN(num)) {
            methods.logs.push(`expected number, got ${typeof num}, ${num}`)
            return emptyVal
        }

        return num
    },

    phone: (phone, emptyVal) => {
        if (!phone || phone === ``) {
            methods.logs.push(`no phone`)
            return emptyVal
        }

        phone = `${phone}`

        phone = phone.replace(/[^0-9]/g, '')
        if (phone.length > 10) { return phone.slice(-10) }
        if (phone.length < 10) {
            methods.logs.push(`invalid phone length, ${phone}`)
            return emptyVal
        }
        return phone
    },

    address: (addressObj, emptyVal) => {
        if (!addressObj) {
            methods.logs.push(`no addressObj`)
            return emptyVal
        }

        const validZip = zip => {
            if (zip.length > 5) { return zip.slice(0, 5) }
            zip = `00000${zip}`.slice(-5)
            return zip
        }

        return Object.assign({}, addressObj, zips[validZip(addressObj.zip)] || addressObj)
    },

    email: (str, emptyVal) => {
        const split = str.split(`@`)

        if (!split[0] || !split[0].length) {
            methods.logs.push(`${str}, missing username`)
            return emptyVal
        }

        if (split.length < 2) {
            methods.logs.push(`${str}, missing domain, i.e. "mail.com"`)
            return emptyVal
        }

        if (split.length > 1) {
            const domain = split[1].split(`.`)

            if (!domain[0] || !domain[0].length || !domain[1] || !domain[1].length) {
                methods.logs.push(`${str}, missing domain, i.e. "mail.com"`)
                return emptyVal
            }
        }

        return str
    }
}

module.exports = methods