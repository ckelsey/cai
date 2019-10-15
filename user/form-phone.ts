import User from './user'
import { FormHelperMergeData, FormHelperCancelClickAndGetData, FormStandardButtons } from './user-form-helpers'

export const PhoneFormSubmitVerifySMS =
    (e: Event, data: any) =>
        User.verifyPhone(
            FormHelperMergeData(
                FormHelperCancelClickAndGetData(e, data)
            )
        )

export const PhoneFormHeading = (item: any) => item.phoneNum ?
    `${
    !!item.phoneNum ? item.phoneNum.toString()[0] : ``
    } (${
    !!item.phoneNum ? item.phoneNum.toString().substring(1, 4) : ``
    }) ${
    !!item.phoneNum ? item.phoneNum.toString().substring(4, 7) : ``
    }-${
    !!item.phoneNum ? item.phoneNum.toString().substring(7) : ``
    }`
    : ``

export const PhoneFormFields = [
    [`phoneNum`, `type`, `carrier`],
    [`startDate`, `endDate`, `isPrimary`],
    [`file`]
]

export const PhoneFormButtons = (item: any) => {
    const phoneButtons: any[] = [{
        label: `SMS Verification`,
        type: `button`,
        position: `left`,
        classes: [`btn-primary`],
        get condition() { return !!item.id && item.SMSVerification !== 1 && item.type === `mobile` },
        action: (e: Event, data: any) => PhoneFormSubmitVerifySMS(e, data),
    }, {
        label: `Verified`,
        type: `text`,
        position: `left`,
        classes: [`color-primary`, `checkmark-before`],
        get condition() { return item.SMSVerification === 1 || item.confirmed === 1 },
    }, {
        label: `Not verified`,
        type: `text`,
        position: `left`,
        classes: [`color-danger`, `close-before`],
        get condition() { return !!item.id && item.SMSVerification !== 1 && item.confirmed !== 1 },
    }]

    return FormStandardButtons(item, `phoneNumbers`).concat(phoneButtons)
}
