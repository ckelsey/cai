module.exports = (el, path, emptyVal) => {
    let Path = [el]

    if (path && path.toString().split) {
        Path = [el].concat(path.toString().split(`.`))
    }

    const result = Path.reduce((accumulator, currentValue) => {
        if (accumulator === undefined) {
            return emptyVal
        }

        if (currentValue.indexOf(`.`) === -1 && currentValue.indexOf(`(`) > -1) {
            const reg = /\((.*?)\)/g.exec(currentValue)
            const argsString = reg ? reg[1] : ``
            const args = argsString.split(`,`).map((arg) => arg.trim())
            const functionName = currentValue.split(`(`)[0]

            if (typeof accumulator[functionName] === `function`) {
                return accumulator[functionName].apply(accumulator, args)
            }
        }

        if (currentValue) {
            return accumulator[currentValue]
        } else {
            return accumulator
        }

    })

    if (result === undefined) {
        return emptyVal
    }

    return result
}