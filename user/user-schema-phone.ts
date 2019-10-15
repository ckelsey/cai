import Validate from '../validate'
import { confirmed, requiredText, notRequiredText, phoneTypes, current, endDate, startDate } from './user-schema-helpers'

export const phoneNumbers = {
    type: `array`,
    properties: {
        phoneNum: {
            type: `text`,
            formField: true,
            required: true,
            error: ``,
            label: `Number`,
            key: `phoneNum`,
            validation: (val: any) => Validate.phone(val)
        },
        SMSVerification: {
            model: (val: any) => val.SMSVerification && val.SMSVerification.hasOwnProperty(`verified`) ? val.SMSVerification.verified : val.SMSVerification,
            type: `number`,
            key: `SMSVerification`,
            validation: confirmed.validation
        },
        type: {
            type: `select`,
            formField: true,
            required: true,
            error: ``,
            options: phoneTypes,
            label: `Type`,
            key: `type`,
            validation: (val: any) => Validate.oneOf(phoneTypes.map((v) => v.value), val)
        },
        id: Object.assign({ key: `id` }, notRequiredText),
        carrier: Object.assign({ label: `Carrier`, key: `carrier` }, requiredText),
        confirmed,
        endDate: Object.assign({ label: `End date` }, endDate),
        startDate: Object.assign({ label: `Start date` }, startDate),
        isPrimary: Object.assign({}, current, { label: `Primary`, key: `isPrimary` }),
        file: {
            type: `file`,
            formField: true,
            required: true,
            error: ``,
            label: `Phone bill`,
            key: `file`,
            validation: (val: any) => ({ valid: !!val, sanitized: val })
        }
    }
}
