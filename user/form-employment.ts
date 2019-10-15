export const EmploymentFormHeading = (item: any) => `${item.company[0].toUpperCase}${item.company.substring(1)}`

export const EmploymentFormFields = [
    [`company`, `current`],
    [`startDate`, `endDate`],
    [`file`]
]
