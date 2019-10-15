// https://github.com/mozilla/pdf.js/tree/master/examples/node

const file = process.env.FILE

if (!file) {
    throw new Error('FILE is required')
}

// const name = file.split('.pdf')[0].split('/').pop()
// const pdftohtml = require('pdftohtmljs')
// return new pdftohtml(file, `./output/${name}.html`)
//     .convert()
//     .then(r => console.log('success', r))
//     .catch(e => new Error(e))

const fs = require('fs')
const util = require('util')
const path = require('path')
const stream = require('stream')

// HACK few hacks to let PDF.js be loaded not as a module in global space.
require('./domstubs.js.js').setStubs(global)

const pdfjsLib = require('pdfjs-dist')

const pdfPath = file
const data = new Uint8Array(fs.readFileSync(pdfPath))
const outputDirectory = './output'

try {
    fs.mkdirSync(outputDirectory);
} catch (e) {
    if (e.code !== 'EEXIST') {
        throw e;
    }
}

// Dumps svg outputs to a folder called svgdump
function getFilePathForPage(pageNum) {
    var name = path.basename(pdfPath, path.extname(pdfPath));
    return path.join(outputDirectory, name + '-' + pageNum + '.svg');
}

/**
 * A readable stream which offers a stream representing the serialization of a
 * given DOM element (as defined by domstubs.js).
 *
 * @param {object} options
 * @param {DOMElement} options.svgElement The element to serialize
 */
function ReadableSVGStream(options) {
    if (!(this instanceof ReadableSVGStream)) {
        return new ReadableSVGStream(options);
    }
    stream.Readable.call(this, options);
    this.serializer = options.svgElement.getSerializer();
}

util.inherits(ReadableSVGStream, stream.Readable);
// Implements https://nodejs.org/api/stream.html#stream_readable_read_size_1

ReadableSVGStream.prototype._read = function () {
    var chunk;
    while ((chunk = this.serializer.getNext()) !== null) {
        if (!this.push(chunk)) {
            return;
        }
    }
    this.push(null);
};

// Streams the SVG element to the given file path.
function writeSvgToFile(svgElement, filePath) {
    var readableSvgStream = new ReadableSVGStream({
        svgElement: svgElement,
    });
    var writableStream = fs.createWriteStream(filePath);
    return new Promise(function (resolve, reject) {
        readableSvgStream.once('error', reject);
        writableStream.once('error', reject);
        writableStream.once('finish', resolve);
        readableSvgStream.pipe(writableStream);
    }).catch(function (err) {
        readableSvgStream = null; // Explicitly null because of v8 bug 6512.
        writableStream.end();
        throw err;
    });
}

// Will be using promises to load document, pages and misc data instead of
// callback.
var loadingTask = pdfjsLib.getDocument({
    data: data,
    nativeImageDecoderSupport: pdfjsLib.NativeImageDecoding.DISPLAY,
});
loadingTask.promise.then(function (doc) {
    var numPages = doc.numPages;
    console.log('# Document Loaded');
    console.log('Number of Pages: ' + numPages);
    console.log();

    var lastPromise = Promise.resolve(); // will be used to chain promises
    var loadPage = function (pageNum) {
        return doc.getPage(pageNum).then(function (page) {
            console.log('# Page ' + pageNum);
            var viewport = page.getViewport(1);
            console.log('Size: ' + viewport.width + 'x' + viewport.height);
            console.log();

            return page.getOperatorList().then(function (opList) {
                var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                svgGfx.embedFonts = true;
                return svgGfx.getSVG(opList, viewport).then(function (svg) {
                    return writeSvgToFile(svg, getFilePathForPage(pageNum))
                        .then(function () {
                            console.log('Page: ' + pageNum);
                        }, function (err) {
                            console.log('Error: ' + err);
                        });
                });
            });
        });
    };

    for (var i = 1; i <= numPages; i++) {
        lastPromise = lastPromise.then(loadPage.bind(null, i));
    }
    return lastPromise;
})
    .then(function () {
        console.log('# End of Document');
    })
    .catch(err => {
        console.error('Error: ' + err);
    });