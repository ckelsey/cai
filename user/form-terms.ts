import Constants from '../constants'
import User from './user'
import { FormHelperCancelClickAndGetData } from './user-form-helpers'

const TermsFormAggreeToTerms = (e: Event, data: any) => {
    const Data = FormHelperCancelClickAndGetData(e, data)

    if (!Data) { return }

    return User.update({ clientYN: 1 })
}

export const TermsFormAgentConsent = {
    type: `checkbox`,
    formField: true,
    required: true,
    error: ``,
    key: `agentConsent`,
    label: `<span class="checkbox-label">Allow ${Constants.companyName} to be your agent</span><span class="checkbox-message"> An 'agent' is someone who works on your behalf. In this context, it lets me file your claims, and keep an eye on any court activity that might affect you.</span>`,
    validation: (val: any) => ({
        sanitized: val,
        original: val,
        valid: val === true,
        reason: val === true ? [] : [`required to register`]
    })
}

export const TermsFormAssigneeConsent = Object.assign({}, TermsFormAgentConsent, {
    key: `assigneeConsent`,
    label: `<span class="checkbox-label">Allow ${Constants.companyName} to be your assignee</span><span class="checkbox-message">An 'assignee' is someone you designate to receive something. In this case, it gives my creators the legal right to collect payments for you.</span>`,
})

export const TermsFormFields = [
    [TermsFormAgentConsent],
    [TermsFormAssigneeConsent]
]

export const TermsFormButtons = [{
    label: `Submit`,
    type: `button`,
    position: `left`,
    classes: [`btn-secondary`],
    action: (e: Event, data: any) => TermsFormAggreeToTerms(e, data),
    get condition() { return true }
}]
