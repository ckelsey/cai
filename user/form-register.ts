import { TermsFormAssigneeConsent } from './form-terms'
import { FormHelperLoginRegister } from './user-form-helpers'
import state from '../state'

export const RegisterFormFields = [
    [`fname`, `lname`],
    [`email`],
    [`password`, `confirmPassword`],
    [TermsFormAssigneeConsent],
    [TermsFormAssigneeConsent]
]

export const RegisterFormButtons = [{
    label: `Sign up`,
    type: `button`,
    position: `left`,
    classes: [`btn-secondary`],
    action: (e: Event, data: any) => FormHelperLoginRegister(e, data, `register`),
    get condition() { return true }
}, {
    label: `Have an account?`,
    type: `text`,
    position: `right`,
    classes: [`btn`, `btn-link`],
    action: (e: Event) => {
        if (e) { e.preventDefault() }
        state.state = `login`
    },
    get condition() { return true }
}]
