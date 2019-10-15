const gulp = require('gulp')
const exec = require('child_process').exec

const moveFiles = () => new Promise((resolve, reject) => {
    exec(`cp mac/{index.js,package.json} linux/`, (err, stdout, stderr) => {
        if (err || stderr) {
            console.log(err)
            console.log(stderr)
            return reject(err || stderr)
        }

        return resolve()
    })
})

const remove = () => new Promise(resolve => exec(`find . -type f ! -name "*.*" -delete && rm linux/renderExport.zip`, resolve))

const zip = () => new Promise(
    (resolve, reject) => moveFiles()
        .then(remove)
        .then(() => {
            exec(`cd linux && zip -r renderExport.zip .`, (err, stdout, stderr) => {
                if (err || stderr) {
                    console.log(err)
                    console.log(stderr)
                    return reject(err || stderr)
                }

                return resolve()
            })
        })
        .catch(reject)
)



gulp.task(`default`, gulp.parallel(zip))