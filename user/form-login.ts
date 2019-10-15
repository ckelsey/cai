import state from '../state'
import { FormHelperLoginRegister } from './user-form-helpers'

export const LoginFormFields = [
    [`email`],
    [`password`]
]

export const LoginFormButtons = [{
    label: `Login`,
    type: `button`,
    position: `left`,
    classes: [`btn-secondary`],
    action: (e: Event, data: any) => FormHelperLoginRegister(e, data, `login`),
    get condition() { return true }
}, {
    label: `Need an account?`,
    type: `text`,
    position: `right`,
    classes: [`btn`, `btn-link`],
    action: (e: Event) => {
        if (e) { e.preventDefault() }
        state.state = `register`
    },
    get condition() { return true }
}]
