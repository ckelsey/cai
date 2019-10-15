const REGION = process.env.REGION || `us-east-1`
const SOURCEBUCKET = process.env.SOURCEBUCKET || `cai-filing`
const AWS = require("aws-sdk")
const fs = require('fs')
const path = require('path')
const phantom = require('phantom')
const S3 = new AWS.S3({ signatureVersion: 'v4', region: REGION })
// const os = require('os')
// const childProcess = require('child_process')
// const phantomjs = require('phantomjs-prebuilt')
// const rsvgBinaryPath = `/opt/bin/rsvg-convert`

const renderSVGs = (svgs, pages, styles, data) => new Promise((resolve, reject) => {
    const svgStrings = []

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

        svgStrings.push(`${startOfSVG}</svg>`)

        // const svgPath = path.join(os.tmpdir(), `${index}.svg`)
        // fs.writeFileSync(svgPath, `${startOfSVG}</svg>`)
        // svgPaths.push(svgPath)
    })

    const svgMarkup = svgStrings.map((svg, index) => `<div id="svg_containter_${index}">${svg}</div>`)
    const jsPdfContents = fs.readFileSync(path.resolve(`node_modules/jspdf-yworks/dist/jspdf.min.js`), 'utf8')
    const svg2PdfContents = fs.readFileSync(path.resolve(`node_modules/svg2pdf.js/dist/svg2pdf.min.js`), 'utf8')
    const head = `<head><script>${jsPdfContents}</script><script>${svg2PdfContents}</script></head>`
    const scriptToRun = `<script>
        ${svgStrings.map((s, i) => `var svg${i} = document.getElementById('svg_containter_${i}');`).join(' ')}
        var pdf = new jsPDF('p', 'pt', [792, 612]);
        ${svgStrings.map((s, i) => `svg2pdf(svg${i}, pdf, { scale: 1 }); pdf.addPage();`).join(' ')}
        window.PDFExportData = pdf.output('datauristring');
    </script>`
    const html = `<!DOCTYPE html><html lang="en">${head}<body>${svgMarkup}${scriptToRun}</body></html>`
    let instance
    let page

    phantom.create().then(ph => {
        instance = ph
        return instance.createPage()
    }).then(p => {
        page = p
        return page.content = html
    }).then(function (status) {
        console.log(status)
        return page.property('content')
    }).then(function (content) {
        console.log(content)
        return page.evaluate(() => {
            return window.PDFExportData
        })
    }).then(function (PDFExportData) {
        console.log(PDFExportData)
        page.close()
        instance.exit()
        return resolve(PDFExportData)
    }).catch(reject)

    // const page = require('webpage').create()
    // const server = require('webserver').create()
    // const system = require('system')

    // const phantom = phantomjs.exec('phantomjs-script.js', 'arg1', 'arg2');

    // phantom.stdout.on('data', function (buf) {
    //     console.log('[STR] stdout "%s"', String(buf));
    // });
    // phantom.stderr.on('data', function (buf) {
    //     console.log('[STR] stderr "%s"', String(buf));
    // });
    // phantom.on('close', function (code) {
    //     console.log('[END] code', code);
    // });

    // phantom.on('exit', code => {
    //     callback(null, 'fin!!');
    // });

    // const pdfName = `${data.fname}_${data.lname}_${data.userId}.pdf`
    // const pdfPath = path.join(os.tmpdir(), pdfName)
    // const toPDF = childProcess.spawn(
    //     rsvgBinaryPath,
    //     svgPaths.concat([
    //         `-o`,
    //         pdfPath,
    //         `-f`,
    //         `pdf`
    //     ])
    // )

    // toPDF.on('close', function (code) {
    //     if (code !== 0) {
    //         reject(code)
    //     } else {
    //         // svgPaths.forEach(p => fs.unlinkSync(p))
    //         resolve({ filePath: pdfPath, name: pdfName, svgs: svgPaths })
    //     }
    // })
})

const uploadToS3 = (data, Key) => new Promise((resolve, reject) => {
    S3.upload({
        Key,
        Bucket: SOURCEBUCKET,
        Body: data,
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
        const pdfData = await renderSVGs(
            event.svgs,
            event.pages,
            event.styles,
            event.query
        )
        console.log(pdfData)
        const uploaded = await uploadToS3(pdfData, `${event.name}/output/pdfs/${event.query.fname}_${event.query.lname}_${event.query.userId}.pdf`)
        // const uploaded = await uploadToS3(renderedPDF.filePath, `${event.name}/output/pdfs/${renderedPDF.name}`)

        // const uploadedSvgs = await uploadToS3(renderedPDF.svgs[0], `${event.name}/output/svgs/${event.query.userId}.svg`)
        //     Promise.all(
        //     renderedPDF.svgs.map(
        //         svg => uploadToS3(svg, `${event.name}/output/svgs/${event.query.userId}.svg`)
        //     )
        // )
        // console.log(uploaded)
        // console.log(uploadedSvgs)
        return respond(undefined, uploaded)
    } catch (error) {
        console.log(error)
        return respond(error)
    }
}
