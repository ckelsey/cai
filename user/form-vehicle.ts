export const VehicleFormHeading = (item: any) => `${item.model[0].toUpperCase}${item.model.substring(1)}`

export const VehicleFormFields = [
    [`make`, `model`, `year`],
    [`startDate`, `endDate`],
    [`vin`, `current`],
    [`file`]
]
