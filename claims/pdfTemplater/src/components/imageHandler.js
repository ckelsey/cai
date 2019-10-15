import { validFile } from '../utils/validFile'
import { subscribes } from '../utils/subscribes'
import { ClearInput } from '../utils/pageHelpers'

export const ImgHandler = inputSelector => {
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

            if (!e || !e.target || !validFile(e.target.files, [`image/jpeg`, `image/jpg`, `image/png`])) {
                const err = `Invalid file`
                result.trigger(`error`, err)
                result.clear()
                return reject(err)
            }

            hasFile = true
            const file = e.target.files[0]
            const reader = new FileReader()

            reader.onload = function () {
                const img = new Image()
                img.onload = function () {
                    result.trigger(`file`, img)
                    result.clear()
                    return resolve(img)
                }
                img.onerror = function () {
                    const error = `Invalid image`
                    result.trigger(`error`, error)
                    result.clear()
                    return reject(error)
                }

                img.src = reader.result
            }

            reader.readAsDataURL(file)
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