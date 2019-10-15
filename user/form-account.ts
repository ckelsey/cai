import User from './user'
import State from '../state'
import { FormHelperMergeData, FormHelperCancelClickAndGetData } from './user-form-helpers'

export const AccountFormHeading = (item: any) => `${item.fname ? item.fname[0].toUpperCase : ``}${item.fname ? item.fname.substring(1) : ``}`

export const AccountFormFields = [
    [`fname`, `lname`],
    [`email`],
    [`password`, `confirmPassword`]
]

export const AccountFormButtons = [
    {
        label: `Update`,
        type: `button`,
        position: `left`,
        classes: [`btn-secondary`],
        get condition() { return User.model$.value.active === 1 },
        action: (e: Event, data: any) => {
            const Data = FormHelperCancelClickAndGetData(e, data)

            if (!Data) { return }

            if (Data.email !== User.model$.value.email) {
                State.alert = Object.assign({}, {
                    msg: `Check your email for a confirmation message. You must confirm your email address before you can use it to log in`,
                    active: true,
                    status: `alert-warning`,
                })
            }

            return User.update(FormHelperMergeData(Data))
        },
    }, {
        label: `Reactivate`,
        type: `button`,
        position: `left`,
        classes: [`btn-primary`],
        get condition() { return User.model$.value.active === 0 },
        action: (e: Event) => {
            if (e) { e.preventDefault() }
            User.activate()
        },
    }, {
        label: `Deactivate`,
        type: `text`,
        position: `right`,
        classes: [`color-danger`, `pointer`],
        get condition() { return User.model$.value.active === 1 },
        action: (e: Event) => {
            if (e) { e.preventDefault() }
            User.deactivate()
        },
    },
]
