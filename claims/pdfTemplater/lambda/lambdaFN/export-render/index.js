const REGION = process.env.REGION || `us-east-1`
const SOURCEBUCKET = process.env.SOURCEBUCKET || `cai-filing`
const AWS = require("aws-sdk")
const fs = require('fs')
const os = require('os')
const path = require('path')
const childProcess = require('child_process')
const S3 = new AWS.S3({ signatureVersion: 'v4', region: REGION })
const rsvgBinaryPath = `/opt/bin/rsvg-convert`

const renderSVGs = (svgs, pages, styles, data) => new Promise((resolve, reject) => {
    const svgPaths = []

    svgs.forEach((svg, index) => {
        let startOfSVG = svg.split(`</svg>`).filter(b => !!b).join(`</svg>`)
        Object.keys(pages[index].elements).forEach(elementKey => {
            const element = pages[index].elements[elementKey]
            const attributes = []



            attributes.push(`x="${element.x}"`)

            if (element.tag === `text`) {
                attributes.push(`y="${element.y}"`)
                Object.keys(styles).forEach(styleKey => {
                    if (styleKey === `fontFamily`) { return }
                    const attr = styleKey === `color` ? `fill` : styleKey.replace(/(?:^|\.?)([A-Z])/g, (x, y) => `-${y.toLowerCase()}`).replace(/^_/, ``)
                    const valToUse = !!element.styles[styleKey] ? element.styles[styleKey] : styles[styleKey]
                    const value = [`letterSpacing`, `fontSize`].indexOf(styleKey) > -1 ? `${valToUse}px` : valToUse
                    attributes.push(`${attr}="${value}"`)
                })
            } else {
                attributes.push(`href="${element.href}"`)
                attributes.push(`alignment-baseline="center"`)
                attributes.push(`width="${element.w}"`)
                attributes.push(`height="${element.h}"`)

                // TODO - weird image issue
                attributes.push(`y="${element.y - 45}"`)
            }

            startOfSVG = `${startOfSVG}<${element.tag} ${attributes.join(' ')}>${data[element.text] || element.text || ``}</${element.tag}>`
        })

        const svgPath = path.join(os.tmpdir(), `${index}.svg`)
        fs.writeFileSync(svgPath, `${startOfSVG}</svg>`)
        svgPaths.push(svgPath)
    })

    const pdfName = `${data.fname}_${data.lname}_${data.userId}.pdf`
    const pdfPath = path.join(os.tmpdir(), pdfName)
    const toPDF = childProcess.spawn(
        rsvgBinaryPath,
        svgPaths.concat([
            `-o`,
            pdfPath,
            `-f`,
            `pdf`
        ])
    )

    toPDF.on('close', function (code) {
        if (code !== 0) {
            reject(code)
        } else {
            // svgPaths.forEach(p => fs.unlinkSync(p))
            resolve({ filePath: pdfPath, name: pdfName, svgs: svgPaths })
        }
    })
})

const uploadToS3 = (filePath, Key) => new Promise((resolve, reject) => {
    S3.upload({
        Key,
        Bucket: SOURCEBUCKET,
        Body: fs.createReadStream(filePath),
        ACL: 'private'
    }, (error, result) => {
        if (error) {
            reject(error)
        } else {
            resolve(result)
        }
    })
})

exports.handler = async (event) => {
    const respond = (err, result) => {
        const response = {
            statusCode: err ? 400 : 200,
            body: JSON.stringify(err || result),
        };
        return response
    }

    console.log(event.pages)

    try {
        const renderedPDF = await renderSVGs(
            event.svgs,
            event.pages,
            event.styles,
            event.query
        )
        console.log(renderedPDF)
        const uploaded = await uploadToS3(renderedPDF.filePath, `${event.name}/output/pdfs/${renderedPDF.name}`)

        const uploadedSvgs = await uploadToS3(renderedPDF.svgs[0], `${event.name}/output/svgs/${event.query.userId}.svg`)
        //     Promise.all(
        //     renderedPDF.svgs.map(
        //         svg => uploadToS3(svg, `${event.name}/output/svgs/${event.query.userId}.svg`)
        //     )
        // )
        console.log(uploaded)
        console.log(uploadedSvgs)
        return respond(undefined, { uploaded, uploadedSvgs })
    } catch (error) {
        console.log(error)
        return respond(error)
    }
}
