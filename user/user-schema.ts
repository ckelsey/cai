import Validate from '../validate'
import Get from '@/utils/get'
import { confirmed, requiredText, notRequiredText, password, confirmPassword } from './user-schema-helpers'
import { phoneNumbers } from './user-schema-phone'
import { address } from './user-schema-address'
import { employment } from './user-schema-employment'
import { vehicle } from './user-schema-vehicle'

export const UserSchema = {
    properties: {
        clientYN: Object.assign({ key: `clientYN` }, confirmed),
        email: {
            type: `email`,
            key: `email`,
            formField: true,
            required: true,
            error: ``,
            label: `Email`,
            validation: (val: any) => Validate.email(val)
        },
        active: {
            type: `number`,
            key: `active`,
            formField: false,
            required: false,
            validation: (val: any) => {
                /** TODO : workaround as it's as of now not in the API */
                if (val === undefined) {
                    return {
                        original: 1,
                        sanitized: 1,
                        valid: true,
                        reason: []
                    }
                }

                return confirmed.validation(val)
            }
        },
        fname: Object.assign({ label: `First name`, key: `fname` }, requiredText),
        lname: Object.assign({ label: `Last name`, key: `lname` }, requiredText),
        password,
        confirmPassword,
        id: Object.assign({ key: `id` }, notRequiredText),
        refreshToken: Object.assign({ key: `refreshToken` }, notRequiredText),
        token: Object.assign({ key: `token` }, notRequiredText),
        phoneNumbers,
        address,
        employment,
        vehicle
    }
}

export function ValidateData(data: any) {
    const model: any = {}

    Object.keys(data).forEach((key: string) => {
        let val = data[key]
        let schema = Get(UserSchema.properties, key)
        let processed

        if (!schema) {
            return
        }

        if (Array.isArray(val)) {
            if (schema.type !== `array`) {
                return
            }

            schema = schema.properties
            model[key] = []

            val.forEach((item: any) => {
                const itemToAdd: any = {}

                Object.keys(schema).forEach((schemaKey: string) => {
                    let itemValue = item[schemaKey]

                    if (schema[schemaKey].model) {
                        itemValue = schema[schemaKey].model(item)
                    }

                    processed = schema[schemaKey].validation(itemValue, item[schema[schemaKey].validationRequires])

                    if (processed.valid) {
                        itemToAdd[schemaKey] = processed.sanitized
                    } else {
                        itemToAdd[schemaKey] = null
                    }
                })

                model[key].push(itemToAdd)
            })

            return
        }

        if (schema.model) {
            val = schema.model(data)
        }

        processed = schema.validation(val, data[schema.validationRequires])

        if (processed.valid) {
            model[key] = processed.sanitized
        } else {
            model[key] = null
        }

    })

    /** TODO : workaround for active */
    const activeSchema = Get(UserSchema.properties, `active`)
    model.active = activeSchema.validation(data.active).sanitized

    return model
}

export function UserDataToAPI(data: any, urlKey: string) {
    const toConvert = Object.assign({}, data)
    let toApi

    switch (urlKey) {
        case `phonenum`:
            toApi = {
                carrier: toConvert.carrier,
                endDate: toConvert.endDate,
                startDate: toConvert.startDate,
                phoneNum: toConvert.phoneNum,
                type: toConvert.type
            }
            break

        case `address`:
            toApi = {
                zip: toConvert.zip,
                street: toConvert.street,
                state: toConvert.state,
                county: toConvert.county,
                country: toConvert.country,
                city: toConvert.city,
                isPrimary: toConvert.isPrimary,
                endDate: toConvert.endDate,
                startDate: toConvert.startDate,
            }
            break


        default:
            toApi = toConvert
            break
    }

    return toApi
}
