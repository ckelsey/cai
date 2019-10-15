const hummus = require('hummus')
const redactPDF = require('./find-replace')
// const fillForm = require('./pdf-form-fill').fillForm
// const arialFont = pdfWriter.getFontForFile('./Arial.ttf');
// const textOptions = { font: arialFont, size: 14, color: 0x222222 };
const path = require('path')
const templateDirectory = path.resolve(__dirname, '../../assets/docs')
const outputDirectory = path.resolve(__dirname, '../../output_pdf/experian')
const dataDirectory = path.resolve(__dirname, '../../data/')
const sourcePdf = path.resolve(templateDirectory, 'sa_support.pdf')
const csv = require('csvtojson')
// const pdfFiller = require('pdffiller')

function fillPdf(destPdf, dataToFill, index) {
    console.log(redactPDF)
    redactPDF(sourcePdf, destPdf, dataToFill)
    // const writer = hummus.createWriterToModify(sourcePdf, { modifiedFilePath: destPdf, compress: false })

    // //get references to the contents stream on the relevant page (first, in this instance)
    // var sourceParser = writer.createPDFCopyingContextForModifiedFile().getSourceDocumentParser();
    // var pageObject = sourceParser.parsePage(0);
    // var textObjectID = pageObject.getDictionary().toJSObject().Contents.getObjectID();
    // var textStream = sourceParser.queryDictionaryObject(pageObject.getDictionary(), 'Contents');

    // //read the original block of text data
    // var data = [];
    // var readStream = sourceParser.startReadingFromStream(textStream);
    // while (readStream.notEnded()) {
    //     var readData = readStream.read(10000);
    //     data = data.concat(readData);
    // }

    // const keys = Object.keys(dataToFill)
    // let keyIndex = keys.length

    // while (keyIndex--) {
    //     //create new string
    //     var string = Buffer.from(data).toString();
    //     string = string.replace(`{{${keys[keyIndex]}}}`, dataToFill[keyIndex]);

    //     //Create and write our new text object
    //     var objectsContext = writer.getObjectsContext();
    //     objectsContext.startModifiedIndirectObject(textObjectID);

    //     var stream = objectsContext.startUnfilteredPDFStream();
    //     stream.getWriteStream().write(strToByteArray(string));
    //     objectsContext.endPDFStream(stream);

    //     objectsContext.endIndirectObject();
    // }



    // writer.end();

    // //removes old objects no longer in use
    // hummus.recrypt(destPdf, destPdf2);

    // function strToByteArray(str) {
    //     var myBuffer = [];
    //     var buffer = Buffer.from(str);
    //     for (var i = 0; i < buffer.length; i++) {
    //         myBuffer.push(buffer[i]);
    //     }
    //     return myBuffer;
    // }


    // writer.end()

    // var sourcePDF = destPdf
    // var destinationPDF = destPdf
    // var shouldFlatten = true

    // pdfFiller.fillFormWithFlatten(sourcePDF, destinationPDF, {}, shouldFlatten, function (err) {
    //     if (err) throw err;
    //     console.log("In callback (we're done).");
    //     console.log(`flattend pdf ${index}`)
    // })

    console.log(`finished pdf ${index}`)
}

csv()
    .fromFile(path.resolve(dataDirectory, 'S0569.csv'))
    .then(jsonObj => {
        fillPdf(
            path.resolve(outputDirectory, `experian_${jsonObj[0].id}.pdf`),
            Object.keys(Object.assign(jsonObj[0], { claimant: `${jsonObj[0].first_name} ${jsonObj[0].last_name}` })).map(k=>`{{${k}}}`),
            1
        )

        // fillPdf(
        //     path.resolve(outputDirectory, `experian_${jsonObj[0].id}.pdf`),
        //     Object.assign(jsonObj[0], { claimant: `${jsonObj[0].first_name} ${jsonObj[0].last_name}` }),
        //     1
        // )
    }

        // jsonObj.forEach(
        //     (obj, index) => fillPdf(
        //         path.resolve(outputDirectory, `experian_${obj.id}.pdf`),
        //         Object.assign(obj, { claimant: `${obj.first_name} ${obj.last_name}` }),
        //         index
        //     )
        // )
    )
