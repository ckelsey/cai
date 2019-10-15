const fs = require('fs')
const { spawn } = require('child_process')
const Path = require('path')

const newId = (prefix) => `${prefix}_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`

const defaultPage = () => ({
    id: newId(`page`),
    elements: {}
})

function writeSvg(pdf, outDirectory) {
    const fileName = Path.parse(pdf).name
    const svgPreName = `${outDirectory}${fileName}_`
    const svgName = `${svgPreName}%d.svg`
    console.log(`write svg:`, pdf, outDirectory, svgName);

    return new Promise((resolve, reject) => {

        const toSvg = spawn('pdf2svg', [pdf, svgName, `all`])

        toSvg.stdout.on('data', chunk => {
            console.log(Buffer.from(chunk).toString())
        })

        toSvg.stderr.on('data', chunk => {
            console.log(`stderr: ${Buffer.from(chunk).toString()}`)
        })

        toSvg.on('close', (code) => {
            fs.readdir(outDirectory, (err, files) => {
                if (err) {
                    throw new Error(err)
                }

                files = files.filter(f => {
                    const parsed = Path.parse(f)
                    console.log(parsed, parsed.ext === `.svg` && parsed.name.indexOf(fileName) > -1)
                    return parsed.ext === `.svg` && parsed.name.indexOf(fileName) > -1
                })
                console.log(`Created ${files.length} files`)
                return resolve(files)
            })
        })
    })
}

function cleanSvg(file, outDirectory) {
    console.log(`clean svg:`, file, outDirectory);

    return new Promise((done, broke) => {
        const path = `${outDirectory}${file}`
        const cleanSvg = spawn('svgo', [path])

        cleanSvg.stdout.on('data', chunk => { console.log(Buffer.from(chunk).toString()) })
        cleanSvg.stderr.on('data', chunk => { console.log(`stderr: ${Buffer.from(chunk).toString()}`) })

        cleanSvg.on('close', () => {
            console.log(`Cleaned ${file}`)
            // const data = fs.readFileSync(path)
            // return done(Buffer.from(data).toString())
            return done(file)
        })
    })
}

const cleanSvgs = (files, outDirectory) => Promise.all(
    files.map(file =>
        cleanSvg(file, outDirectory)
    )
)

const createIfNot = dir => {
    try {
        fs.mkdirSync(dir, { recursive: true })
    } catch (error) { }

    return dir
}

module.exports = (body, name) => {
    return new Promise((resolve, reject) => {
        const outDirectory = createIfNot(`./projects/${name}/`)
        const pdf = `${outDirectory}${name}_${new Date().getTime()}.pdf`

        fs.writeFileSync(pdf, body)

        return writeSvg(pdf, outDirectory)
            .then(files => cleanSvgs(files, outDirectory))
            .then(files => {
                const pages = []

                files.forEach(file => {
                    pages.push(Object.assign({}, defaultPage(), { file: `projects/${name}/${file}` }))
                })

                return resolve(pages)
            })
            .catch(reject)
    })
}