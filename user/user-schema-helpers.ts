import Validate from '../validate'

export const confirmed = {
    type: `number`,
    key: `confirmed`,
    validation: (val: any) => Validate.oneOf([0, 1], Validate.number(val).sanitized)
}

export const requiredText = {
    type: `text`,
    formField: true,
    required: true,
    error: ``,
    validation: (val: any) => Validate.text(val)
}

export const notRequiredText = {
    type: `text`,
    validation: (val: any) => Validate.text(val)
}

export const startDate = {
    type: `date`,
    key: `startDate`,
    formField: true,
    required: true,
    error: ``,
    validation: (val: any, EndDate: any) => {
        if (!val || val === ``) {
            return true
        }

        let processed = Validate.date(val)

        if (EndDate && EndDate !== ``) {
            processed = Validate.dateBefore(val, EndDate)
        }

        return processed
    }
}

export const endDate = {
    type: `date`,
    key: `endDate`,
    formField: true,
    required: false,
    error: ``,
    validation: (val: any, StartDate: any) => {
        if (!val || val === ``) {
            return true
        }

        let processed = Validate.date(val)

        if (StartDate && StartDate !== ``) {
            processed = Validate.dateAfter(val, StartDate)
        }

        return processed
    }
}

export const phoneTypes = [{
    label: `Mobile`,
    value: `mobile`
}, {
    label: `Landline`,
    value: `landline`
}]

export const states = {
    AL: 'Alabama',
    AK: 'Alaska',
    AS: 'American Samoa',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DC: 'District of Columbia',
    DE: 'Delaware',
    FL: 'Florida',
    FM: 'Federated States of Micronesia',
    GA: 'Georgia',
    GU: 'Guam',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MH: 'Marshall Islands',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    MP: 'Northern Mariana Islands',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PW: 'Palau',
    PA: 'Pennsylvania',
    PR: 'Puerto Rico',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    VI: 'Virgin Islands',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
}

export const countries = {
    'United States': `United States`
}

export const current = {
    type: `checkbox`,
    key: `current`,
    formField: true,
    required: false,
    error: ``,
    validation: (val: any) => Validate.bool(val)
}

export const password = {
    type: `password`,
    key: `password`,
    formField: true,
    required: false,
    error: ``,
    label: `Password`,
    validation: (val: any) => Validate.text(val)
}

export const confirmPassword = {
    type: `password`,
    key: `confirmPassword`,
    formField: true,
    required: false,
    error: ``,
    label: `Confirm password`,
    validationRequires: `password`,
    validation: (val: string, other: string) => ({
        valid: val === other,
        sanitized: val,
        original: val,
        reason: val === other ? [] : [`passwords don't match`]
    })
}
