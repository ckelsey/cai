import Get from '@/utils/get'
import { UserSchema } from './user-schema'
import { AccountFormButtons, AccountFormHeading, AccountFormFields } from './form-account'
import { EmploymentFormFields, EmploymentFormHeading } from './form-employment'
import { PhoneFormFields, PhoneFormButtons, PhoneFormHeading } from './form-phone'
import { VehicleFormFields, VehicleFormHeading } from './form-vehicle'
import { LoginFormFields, LoginFormButtons } from './form-login'
import { RegisterFormFields, RegisterFormButtons } from './form-register'
import { TermsFormFields, TermsFormButtons } from './form-terms'
import { FormStandardButtons } from './user-form-helpers'
import { AddressFormHeading, AddressFormFields } from './form-address'

const getSchema = (path: string) => Object.assign({}, Get(UserSchema.properties, path))

const formatHeading = (item: any, type: string) => {
    switch (type) {
        case `account`: return AccountFormHeading(item)
        case `phoneNumbers`: return PhoneFormHeading(item)
        case `address`: return AddressFormHeading(item)
        case `vehicle`: return VehicleFormHeading(item)
        case `employment`: return EmploymentFormHeading(item)
    }
}

const generate = (schema: any, order: string[][], modelKey: string, model: any) => {
    const newForm: any = []
    const existingForms: any = []
    let value

    const map = (item: any) => ({
        form: order.map((row: string[]) =>
            row.map((key: any) => {
                if (typeof key !== `string`) {
                    return Object.assign({}, key)
                }

                value = item[key]

                if (schema[key].model) {
                    value = schema[key].model(item)
                }

                if (!item.hasOwnProperty(key)) {
                    value = ``
                }

                return Object.assign(
                    {},
                    Object.assign(
                        {},
                        schema[key],
                        { key }
                    ),
                    { value }
                )
            })
        ),
        get heading() { return formatHeading(item, modelKey) },
        model: item,
        key: modelKey,
        buttons: FormButtons(item)[modelKey]
    })

    if (modelKey === `account` && !!model) {
        existingForms.push(map(model))

        return { newForm, existingForms, model }
    }

    newForm.push(map({}))

    if (model[modelKey] && typeof model[modelKey].forEach === `function`) {
        model[modelKey].forEach((item: any) => existingForms.push(map(item)))
    }

    return { newForm, existingForms }
}

export const FormFields: any = {
    account: AccountFormFields,
    address: AddressFormFields,
    employment: EmploymentFormFields,
    phoneNumbers: PhoneFormFields,
    vehicle: VehicleFormFields,
    login: LoginFormFields,
    register: RegisterFormFields,
    terms: TermsFormFields
}

/** TODO to check if values have been updated */
export function FormCompare(data: any) {
    const formData = DataFromForm(data.form)
    const diff: any = []

    Object.keys(formData.results).forEach((field: any) => {
        if (formData.results[field] !== data.model[field]) {
            diff.push({
                key: field,
                current: formData.results[field],
                old: data.model[field]
            })
        }
    })

    return {
        diff,
        dirty: diff.length > 0
    }
}

export function FormButtons(item: any): any {
    return {
        account: AccountFormButtons,
        phoneNumbers: PhoneFormButtons(item),
        address: FormStandardButtons(item, `address`),
        employment: FormStandardButtons(item, `employment`),
        vehicle: FormStandardButtons(item, `vehicle`),
        login: LoginFormButtons,
        register: RegisterFormButtons,
        terms: TermsFormButtons
    }
}

export function FormFieldsFlat() {
    const results: { [key: string]: string[] } = {}

    Object.keys(FormFields).forEach((key: string) => {
        results[key] = []
        FormFields[key].forEach((row: string[]) => {
            row.forEach((field: string) => {
                results[key].push(field)
            })
        })
    })

    return results
}

export function UserForm(type: string, user: any) {
    const model = Object.assign({}, user)
    const firstLevelForms = [`account`, `login`, `register`, `terms`]
    const schema = firstLevelForms.indexOf(type) > -1 ? getSchema(``) : getSchema(`${type}.properties`)

    return generate(
        Object.assign({}, schema),
        FormFields[type],
        type,
        model
    )
}

export function DataFromForm(formData: any) {
    const results: any = { results: {}, valid: true }

    const original: any = [].concat(formData)

    const searchForField = (searchKey: string) => {
        if (!searchKey) { return }
        let fieldValue
        let rowCount = original.length

        while (rowCount-- && fieldValue === undefined) {
            const row = original[rowCount]
            let fieldCount = row.length

            while (fieldCount-- && fieldValue === undefined) {
                const field = row[fieldCount]

                if (field.key === searchKey) {
                    fieldValue = field.value
                }
            }
        }

        return fieldValue
    }

    formData = formData.map((row: any) => {
        return row.map((field: any) => {
            field.error = ``
            results.results[field.key] = field.value

            if (!!field.value && field.validation && typeof field.validation === `function`) {
                const validation = field.validation(field.value, searchForField(field.validationRequires))

                if (!validation.valid) {
                    results.valid = false
                    field.error = field.errorMessage || `invalid`
                }
            }

            if (field.required) {
                if (field.value === `` || field.value === undefined) {
                    results.valid = false
                    field.error = `this field is required`
                }
            }

            return field
        })
    })

    return results
}
