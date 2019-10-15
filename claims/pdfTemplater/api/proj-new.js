const fs = require('fs')
const { spawn } = require('child_process')
const Path = require('path')
const defaultProject = {
    pages: [],
    currentPage: 1,
    data: undefined,
    styles: {
        "font-family": "san-serif",
        "font-size": `12px`,
        "letter-spacing": `3px`,
        color: "#333"
    },
    name: 'project'
}

const newId = (prefix) => `${prefix}_${new Date().getTime()}_${Math.round(Math.random() * 1000)}`

const defaultPage = () => ({
    id: newId(`page`),
    elements: {}
})

function writeSvg(pdf, outDirectory, name) {
    console.log(`write svg:`, pdf, outDirectory, name);

    return new Promise((resolve, reject) => {
        const toSvg = spawn('pdf2svg', [pdf, `${outDirectory}${name}_%d.svg`, `all`])

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

                files = files.filter(f => Path.parse(f).ext === `.svg`)
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

    const files = fs.readdirSync(dir)
    for (const file of files) {
        fs.unlinkSync(Path.join(dir, file))
    }

    return dir
}

module.exports = (body, name) => {
    return new Promise((resolve, reject) => {
        const outDirectory = createIfNot(`./projects/${name}/`)
        const pdf = `${outDirectory}${name}.pdf`

        fs.writeFileSync(pdf, body)

        return writeSvg(pdf, outDirectory, name)
            .then(files => cleanSvgs(files, outDirectory))
            .then(files => {
                const projectPath = `${outDirectory}project.json`
                const project = fs.existsSync(`${outDirectory}project.json`) ?
                    JSON.parse(fs.readFileSync(projectPath)) :
                    Object.assign({}, defaultProject, { name })

                project.pages = []

                // files.forEach(data => {
                //     project.pages.push(Object.assign({}, defaultPage(), {data}))
                // })

                files.forEach(file => {
                    project.pages.push(Object.assign({}, defaultPage(), { file: `projects/${name}/${file}` }))
                })

                const p = JSON.stringify(project)

                fs.writeFileSync(projectPath, p)

                return resolve(p)
            })
            .catch(reject)
    })
}