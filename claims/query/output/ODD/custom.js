const validPhone = require('../../src/validPhone')

module.exports = {
    passes: claim => claim.claimData.numInternalDrives !== "0" || claim.claimData.numExternalDrives !== "0",
    customData: (claim, user, settlement) => {
        const phone = `${validPhone(user.phoneNumbers)}`
        const result = {
            phone_area: phone.slice(0, 3),
            phone_prefix: phone.slice(3, 6),
            phone_line: phone.slice(6, 10),
            computer: claim.claimData.numInternalDrives,
            standalone: claim.claimData.numExternalDrives,
        }
        return result
    },

    settlement: () => {
        return {
            id: "S0034",
            company_name: "c/o Epiq",
            company_street: "P.O. Box 10622",
            company_location: "Dublin, OH 43017-9222",
            fileDate: "06-28-2019"
        }
    }
}