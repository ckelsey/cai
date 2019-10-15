import User from './user'
import State from '../state'
import { DataFromForm } from './user-forms'


export const FormHelperMergeData = (data: any) => data ? Object.assign({}, User.model$.value, data) : undefined

export const FormHelperCancelClickAndGetData = (e: Event, data: any) => {
    if (e) { e.preventDefault() }

    const formData = DataFromForm(data)

    if (!formData.valid) {
        State.alert = Object.assign({}, {
            msg: `Invalid data`,
            active: true,
            status: `alert-error`,
            closeIn: 2000
        })
        return
    }

    return formData.results
}

const FormHelperDeleteData =
    (e: Event, data: any, key: string) =>
        User.deleteData(
            FormHelperMergeData(
                FormHelperCancelClickAndGetData(e, data)
            )
            , key
        )

export const FormHelperSubmitData = (e: Event, data: any, key: string) => {
    const Data = FormHelperCancelClickAndGetData(e, data)

    if (!Data) { return }

    return User.updateData(Data, key)
}

export const FormHelperLoginRegister = (e: Event, data: any, type: string) => {
    const Data = FormHelperCancelClickAndGetData(e, data)

    if (!Data) { return }

    Data.email_current = Data.email

    const method = type === `login` ? User.login : User.register

    return method(Data)
        .then((res) => {
            if (!res || (res && !res.token)) { throw new Error(!res ? `Error logging in, please try again` : res.error) }
            return State.state = `profile`
        })
        .catch((err) => {
            State.alert = Object.assign({}, {
                msg: err,
                active: true,
                status: `alert-error`,
                closeIn: 2000
            })
            return
        })
}

export const FormStandardButtons = (item: any, key: string) => {
    return [{
        label: `Add`,
        type: `button`,
        position: `left`,
        classes: [`btn-secondary`],
        get condition() { return !item.id },
        action: (e: Event, data: any) => FormHelperSubmitData(e, data, key),
    }, {
        label: `Update`,
        type: `button`,
        position: `left`,
        classes: [`btn-secondary`],
        get condition() { return item.id },
            action: (e: Event, data: any) => FormHelperSubmitData(e, data, key),
    }, {
        label: `Delete`,
        type: `text`,
        position: `right`,
        classes: [`color-danger`, `pointer`],
        get condition() { return !!item.id },
        action: (e: Event, data: any) => FormHelperDeleteData(e, data, key),
    }]
}
