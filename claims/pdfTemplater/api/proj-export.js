const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { Parser } = require('json2csv')
const getQuery = require('./query-get')

const getSvgs = pages => pages.map(p => fs.readFileSync(p.file).toString())

const createIfNot = dir => {
    try {
        fs.mkdirSync(dir, { recursive: true })
    } catch (error) { }

    return dir
}

const renderSVGs = (files, pages, styles, data, outDirectory) => {
    return new Promise((resolve, reject) => {
        let completed = []
        // const done = () => resolve(completed)
        const svgsPath = `${outDirectory}/${data.userId}/svgs/`
        const pdfsPath = `${outDirectory}/${data.userId}/pdfs/`
        const renderedPath = `${outDirectory}/rendered/`

        createIfNot(svgsPath)
        createIfNot(pdfsPath)
        createIfNot(renderedPath)

        files.forEach((file, index) => {
            let startOfSVG = file.split(`</svg>`).filter(b => !!b).join(`</svg>`)
            Object.keys(pages[index].elements).forEach(elementKey => {
                const element = pages[index].elements[elementKey]
                const attributes = []

                Object.keys(styles).forEach(styleKey => {
                    const attr = styleKey === `color` ? `fill` : styleKey.replace(/(?:^|\.?)([A-Z])/g, (x, y) => `-${y.toLowerCase()}`).replace(/^_/, ``)
                    const valToUse = !!element.styles[styleKey] ? element.styles[styleKey] : styles[styleKey]
                    const value = [`letterSpacing`, `fontSize`].indexOf(styleKey) > -1 ? `${valToUse}px` : valToUse
                    attributes.push(`${attr}="${value}"`)
                })

                attributes.push(`x="${element.x}"`)


                if (element.w && element.w !== `auto`) {
                    attributes.push(`width="${element.w}"`)
                }

                if (element.h && element.h !== `auto`) {
                    attributes.push(`height="${element.h}"`)
                }

                if (!!element.href && element.href !== ``) {
                    attributes.push(`xlink:href="${element.href}"`)
                    attributes.push(`alignment-baseline="center"`)

                    // TODO - weird image issue
                    attributes.push(`y="${element.y - 45}"`)
                } else {
                    attributes.push(`y="${element.y}"`)
                }

                startOfSVG = `${startOfSVG}<${element.tag} ${attributes.join(' ')}>${data[element.text] || element.text || ``}</${element.tag}>`
            })

            fs.writeFileSync(`${svgsPath}${index}.svg`, `${startOfSVG}</svg>`)

            const toPDF = spawn('inkscape', [
                path.join(__dirname, `${svgsPath}${index}.svg`),
                `--without-gui`,
                `--export-pdf=${path.join(__dirname, `${pdfsPath}${index}.pdf`)}`
            ])

            toPDF.on('close', () => {
                completed.push(`${pdfsPath}${index}.pdf`)

                if (completed.length === files.length) {
                    // return resolve(completed.sort())

                    const mergedFile = `${renderedPath}${data.name.replace(/[\W_]+/g, '_')}_${data.userId}.pdf`
                    const merge = spawn('gs', [
                        `-q`,
                        `-dNOPAUSE`,
                        `-dBATCH`,
                        `-sDEVICE=pdfwrite`,
                        `-sOutputFile=${path.join(__dirname, mergedFile)}`
                    ].concat(completed.sort()))
                    // `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=merged.pdf source1.pdf source2.pdf source3.pdf`

                    merge.on('close', () => {
                        console.log(`done: ${mergedFile}`)
                        const un = spawn('rm', [
                            `-R`,
                            `${outDirectory}/${data.userId}`,
                        ])

                        un.on('close', () => {
                            return resolve(mergedFile)
                        })
                    })
                }
            })
        })
    })
}

const writeCSV = (obj, filePath) => {
    const fields = Object.keys(obj[0])
    const opts = { fields };

    try {
        const parser = new Parser(opts)
        const csv = parser.parse(obj)
        fs.writeFileSync(filePath, csv)
    } catch (err) { console.error(err) }
}


module.exports = body => {
    return new Promise((resolve, reject) => {
        try {
            body = JSON.parse(body)
        } catch (error) {
            return reject(error)
        }

        return getQuery(JSON.stringify(body.query))
            .then(queryResult => {
                createIfNot(`projects/${body.name}/output/`)
                const files = getSvgs(body.pages)
                queryResult = JSON.parse(queryResult)
                writeCSV(queryResult, `projects/${body.name}/output/${body.name}.csv`)
                resolve()
                // const completed = []

                // const render = index => {
                //     if (!queryResult[index]) {
                //         return resolve(completed)
                //     }

                //     renderSVGs(files, body.pages, body.styles, queryResult[index], `projects/${body.name}/output`)
                //         .then(file => {
                //             completed.push(file)
                //             render(index + 1)
                //         })
                // }

                // render(0)

                // return resolve(renderSVGs(files, body.pages, body.styles, queryResult[0], `projects/${body.name}/output`))

                // return resolve(Promise.all(
                //     queryResult.map(qres => renderSVGs(files, body.pages, body.styles, qres, `projects/${body.name}/output`))
                // ))
            })
            .catch(reject)
    })
}