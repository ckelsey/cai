import constants from "../constants"
import Get from "../utils/get"

export const API = (reqData) => {
    const base = constants.api
    const path = `${base}/${Get(reqData, 'path', '')}`
    const REQ = Object.assign({}, {
            data: undefined,
            headers: {},
            method: `POST`
        },
        reqData, { path }
    )

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open(REQ.method, REQ.path, true)

        Object.keys(REQ.headers).forEach(key => {
            xhr.setRequestHeader(key, REQ.headers[key])
        })

        xhr.onload = function() {
            let res = xhr.responseText

            try {
                res = JSON.parse(res)
            } catch (error) {}

            return resolve(res)
        }
        xhr.onerror = function() {
            return reject(xhr.statusText)
        }
        xhr.send(REQ.data)
    })
}