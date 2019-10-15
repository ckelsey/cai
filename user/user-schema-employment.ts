import { requiredText, current, endDate, startDate } from './user-schema-helpers'

export const employment = {
    type: `array`,
    properties: {
        company: Object.assign({}, requiredText, { label: `Company`, key: `company` }),
        endDate: Object.assign({}, endDate, { label: `Leave date` }),
        startDate: Object.assign({}, startDate, { label: `Start date` }),
        current: Object.assign({}, current, { label: `Current` }),
        file: {
            type: `file`,
            formField: true,
            required: true,
            error: ``,
            label: `Pay stub`,
            key: `file`,
            validation: (val: any) => ({ valid: !!val, sanitized: val })
        }
    }
}
