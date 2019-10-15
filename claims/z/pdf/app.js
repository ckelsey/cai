const hummus = require('hummus')
const path = require('path')
const csv = require('csvtojson')
const redactPDF = require('./find-replace')
const sourcePdf = './template.pdf'
const OUTDIR = process.env.OUTDIR
const CSVFILE = process.env.CSV
const PROJECT = process.env.PROJECT

function fillPdf(destPdf, dataToFill, index) {
    redactPDF(sourcePdf, destPdf, dataToFill)
    console.log(`finished pdf ${index}`)
}

if(!CSVFILE || !OUTDIR || !PROJECT){
    return
}

csv()
    .fromFile(CSVFILE)
    .then(jsonObj => 
        fillPdf(
            path.resolve(OUTDIR, `${PROJECT}_${jsonObj[0].id}.pdf`),
            Object.keys(jsonObj[0]).map(k=>`{{${k}}}`),
            1
        )
    )
