const CAI = require('../data/cai.json')

const populatePhone = phone => {
    phone = phone[Object.keys(phone)[0]].replace(/[^0-9]/g, '')
    if (phone.length > 10) { return phone.slice(-10) }
    if (phone.length < 10) { return CAI.phone }
    return phone
}
const isValidPhone = phone =>
    !!phone && typeof phone === `object` && Object.keys(phone).length ?
    phone :
    {
        [CAI.phone]: CAI.phone
    }
const validPhone = phone => populatePhone(isValidPhone(phone))

module.exports = validPhone