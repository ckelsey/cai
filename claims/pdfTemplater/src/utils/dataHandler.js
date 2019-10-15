import { validFile } from '../utils/validFile'
import { subscribes } from '../utils/subscribes'
import { ClearInput } from './pageHelpers'

export const DataHandler = inputSelector => {
    let hasFile = false
    const input = document.body.querySelector(inputSelector)
    const clear = () => {
        hasFile = false
        return ClearInput(input)
    }
    const result = {
        clear,
        ...subscribes({})
    }

    result.getFile = e => {
        return new Promise((resolve, reject) => {
            if (!e || !e.target || !validFile(e.target.files, [`application/pdf`, `text/csv`])) {
                const err = `Invalid file`
                result.trigger(`error`, err)
                result.clear()
                return reject(err)
            }

            hasFile = true
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.onload = function () {
                try {
                    const data = JSON.parse(reader.result)
                    result.trigger(`file`, data)
                    result.clear()
                    return resolve(data)
                } catch (e) {
                    // csvtojson()
                    //     .fromString(reader.result)
                    //     .on(`error`, error => {
                    //         result.trigger(`error`, error)
                    //         result.clear()
                    //         return reject(error)
                    //     })
                    //     .on(`done`, data => {
                    //         result.trigger(`file`, data)
                    //         result.clear()
                    //         return resolve(data)
                    //     })
                }
            }

            reader.readAsText(file)
        })
    }

    input.addEventListener(`input`, result.getFile)
    input.addEventListener(`blur`, e => {
        if (e.target.files.length && !hasFile) {
            return result.getFile(e)
        }
    })

    return result
}