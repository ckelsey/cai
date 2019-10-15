const fs = require('fs')

module.exports = body => {
    return new Promise((resolve, reject) => {
        let name

        try {
            name = JSON.parse(body).name
        } catch (error) {
            return reject(error)
        }

        if (!name || name === ``) {
            return reject(`invalid project name`)
        }

        const dir = `./projects/${name}/`
        const path = `${dir}project.json`
        const writeProject = () => {
            fs.writeFile(path, body, err => {
                if (err) { return reject(err) }
                return resolve(`saved`)
            })
        }

        if (fs.existsSync(dir)) {
            return writeProject()
        } else {
            fs.mkdir(dir, { recursive: true }, err => {
                if (err) { return reject(err) }
                writeProject()
            })
        }
    })
}