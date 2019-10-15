import Validate from '../validate'
import { confirmed, requiredText, states, current, endDate, startDate, countries } from './user-schema-helpers'

export const address = {
    type: `array`,
    properties: {
        city: Object.assign({ label: `City`, key: `city` }, requiredText),
        county: Object.assign({ label: `County`, key: `county` }, requiredText),
        country: {
            type: `select`,
            options: countries,
            formField: true,
            required: true,
            error: ``,
            key: `country`,
            label: `Country`,
            validation: (val: any) => Validate.oneOf(Object.keys(countries), val)
        },
        confirmed,
        endDate: Object.assign({}, endDate, { label: `Move out date` }),
        startDate: Object.assign({}, startDate, { label: `Move in date` }),
        isPrimary: Object.assign({}, current, { label: `Primary`, key: `isPrimary` }),
        state: {
            type: `select`,
            options: states,
            formField: true,
            required: true,
            error: ``,
            key: `state`,
            label: `State`,
            validation: (val: any) => Validate.oneOf(Object.keys(states), val)
        },
        street: Object.assign({}, requiredText, { label: `Street`, key: `street` }),
        zip: {
            type: `text`,
            formField: true,
            required: true,
            error: ``,
            label: `Zip`,
            key: `zip`,
            validation: (val: any) => Validate.usZipCode(val)
        },
        id: {
            model: (val: any) => val._id ? val._id : val.id,
            type: `text`,
            key: `id`,
            validation: (val: any) => Validate.text(val)
        },
        file: {
            type: `file`,
            formField: true,
            required: true,
            error: ``,
            label: `Utility bill`,
            key: `file`,
            validation: (val: any) => ({ valid: !!val, sanitized: val })
        }
    }
}
