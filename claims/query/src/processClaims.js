const CAI = require('../data/cai.json')
const zips = require('../data/zipcodeData.json')
const validPhone = require('./validPhone')

/** =========== MONGO DATES =========== */
const dateToString = (str) => {
    const d = new Date(str)
    const month = `0${d.getMonth() + 1}`.slice(-2)
    const day = `0${d.getDate()}`.slice(-2)
    const year = d.getFullYear()
    const hours = d.getHours()
    const hour = `0${hours > 12 ? hours - 12 : hours}`.slice(-2)
    const minute = `0${d.getMinutes()}`.slice(-2)
    const amPm = hours >= 12 ? `pm` : `am`
    const result = `${month}/${day}/${year} ${hour}:${minute}${amPm}`
    return result
}
const formatDate = d => {
    if (!d) { return '' }
    try { d = d.toJSON() } catch (error) {}
    if (typeof d === 'string') { return dateToString(d) }
    try { d = d.toISOString() } catch (error) {}
    if (typeof d === 'string') { return dateToString(d) }
    return dateToString(d)
}


/** =========== ADDRESS =========== */
const validZip = zip => {
    if (zip.length > 5) { return zip.slice(0, 5) }
    zip = `00000${zip}`.slice(-5)
    return zip
}
const populateCityState = address => Object.assign({}, address, zips[validZip(address.zip)] || address)
const isValidAddress = address => !!address && !!address.street && !!address.zip
const validAddress = address => isValidAddress(address) ? populateCityState(address) : CAI.address


/** =========== VALIDITY CHECK =========== */
// const hasDrives = claim => claim.claimData.numInternalDrives !== "0" || claim.claimData.numExternalDrives !== "0"
// const hasPurchases = claim => Object.keys(claim.claimQualificationData).length
const userAgreed = user => user && user.terms_TS

const allGood = (claim, user, custom) =>
    // hasDrives(claim) &&
    // hasPurchases(claim) &&
    custom.passes(claim, user) &&
    userAgreed(user)
    /** =========== VALIDITY CHECK =========== */


module.exports = (claims, users, settlement, custom) => claims
    .map((claim, i) => {
        const user = users[claim.user_id]

        if (!allGood(claim, user, custom)) { return }

        const address = validAddress(user.address)
        const needsUserAddress = JSON.stringify(address) === JSON.stringify(CAI.address)
        const phone = validPhone(user.phoneNumbers)
        const needsUserPhone = phone === CAI.phone
        const customData = custom.customData(claim, user, settlement)

        return Object.assign({
            /**== CASE INFO ==*/
            date: settlement.fileDate,
            company_name: settlement.company_name,
            company_street: settlement.company_street,
            company_location: settlement.company_location,
            case_name: settlement.settlement_name || '',
            recipient: claim.recipient || '',
            contact: `${CAI.agent}, ${CAI.phone}`,

            /**== CAI INFO ==*/
            ein: CAI.ein,
            agent: CAI.agent,
            agentTitle: CAI.agentTitle,

            /**== CAI USER INFO ==*/
            created: formatDate(claim.createTS),
            client_claim_id: `${settlement.id}${claim.user_id}`, //claim.clientClaimID
            user_id: claim.user_id,
            // db_id: user._id.str,
            // users_id: claim.users_id.str || '',
            // gs_id: claim.user_id || '',
            agreement_date: formatDate(user.terms_TS),
            signup_source: user.signup_source || '',
            last_update_TS: formatDate(user.last_update_TS),
            needsUserPhone,
            needsUserAddress,

            /**== USER INFO ==*/
            claimant: (user.fname + " " + user.lname),
            first_name: user.fname || '',
            last_name: user.lname || '',
            email: (user.email_current ? user.email_current : user.email_original) || CAI.email,
            phone,
            street: address.street,
            city: address.city,
            state: address.state,
            county: address.county,
            zip: address.zip

        }, customData)
    })
    .filter(c => !!c)