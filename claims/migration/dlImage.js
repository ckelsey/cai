const fs = require('fs')
const https = require('https')
const filesToGet = []
// let running = false
const saveImageToDisk = (url, localPath) => {

    return new Promise((resolve, reject) => {
        // if (running) {
        //     return filesToGet.push({ url, localPath })
        // }

        // running = true

        const run = data => {
            try {
                const file = fs.createWriteStream(data.localPath)

                file.on(`close`, () => {
                    return resolve()
                })

                https.get(data.url, function (response) {
                    if (!response) { return }
                    response.pipe(file)
                }).on('error', (e) => {
                    // check()
                    console.error(e);
                    return reject(e)
                })
            } catch (error) {
                console.log(error)
                return reject(error)
            }
        }

        // const check = () => {
        //     if (filesToGet.length) {
        //         run(filesToGet.shift())
        //     } else {
        //         running = false
        //         return resolve()
        //     }
        // }

        run({ url, localPath })
    })

}

module.exports = saveImageToDisk