import { validFile } from '../utils/validFile'
import { subscribes } from '../utils/subscribes'
import { ClearInput } from '../utils/pageHelpers'

export const PDFHandler = inputSelector => {
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
            if (!e || !e.target || !validFile(e.target.files, `application/pdf`)) {
                const err = `Invalid file`
                result.trigger(`error`, err)
                result.clear()
                return reject(err)
            }

            hasFile = true
            const file = e.target.files[0]
            const formData = new FormData()
            formData.append(`file`, file)
            result.trigger(`file`, formData)
            result.clear()
            return resolve(formData)
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