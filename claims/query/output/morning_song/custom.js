const validPhone = require('../../src/validPhone')

module.exports = {
        passes: claim => Object.keys(claim.claimQualificationData).length,
        customData: (claim, user, settlement) => {
                const phone = `${validPhone(user.phoneNumbers)}`
                const result = {
                    phone_area: phone.slice(0, 3),
                    phone_prefix: phone.slice(3, 6),
                    phone_line: phone.slice(6, 10),
                }

                Object.keys(claim.claimQualificationData)
                    .forEach(
                        (key, i) => {
                            const date = new Date(claim.claimQualificationData[key].purchaseDate)
                            const amount = `${claim.claimData[`purchaseAmount${i + 1}`]}`
                    let dollars = `00`
                    let cents = `00`

                    if (!!amount) {
                        if (amount.indexOf(`.`) > -1) {
                            dollars = `${parseInt(amount.split(`.`)[0])}`
                            cents = `0${parseInt(amount.split(`.`)[1])}`.slice(-2)
                        } else {
                            dollars = `${parseInt(amount)}`
                        }
                    }

                    result[`${key}_date_month`] = `0${date.getMonth() + 1}`.slice(-2)
                    result[`${key}_date_day`] = `0${date.getDate()}`.slice(-2)
                    result[`${key}_date_year`] = date.getFullYear()
                    result[`${key}_store`] = claim.claimQualificationData[key].purchaseStore
                    result[`${key}_qty`] = claim.claimQualificationData[key].purchaseQty
                    result[`${key}_amount_dollars`] = dollars
                    result[`${key}_amount_cents`] = cents
                }
            )

        return result
    },

    settlement: () => {
        return {
            id: "S0666",
            company_name: "c/o KCC Class Action Services",
            company_street: "P.O. Box 404107",
            company_location: "Louisville, KY 40233-4107",
            fileDate: "06-30-2019"
        }
    }
}