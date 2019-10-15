const http = require('http')
const url = require('url')
const server = http.createServer().listen(6978)
const router = require('./router')
const convertResult = result => {
    if (result === undefined) { return `` }
    if ([`string`, `number`].indexOf(typeof result) > -1) { return result }

    try {
        result = JSON.stringify(result)
    } catch (error) { }

    return result
}

server.on("request", (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader("Access-Control-Allow-Origin", "*");

    const buffers = []
    const parsedUrl = url.parse(req.url)
    parsedUrl.args = parsedUrl.path.split(`?`)[0].split(`/`).filter(p => !!p)

    const lastArg = parsedUrl.args[parsedUrl.args.length - 1]

    if (!!lastArg && lastArg.indexOf(`.`) > -1) {
        const ext = lastArg.split(`.`)[1]

        if (!!ext) {
            parsedUrl.ext = ext

            switch (ext) {
                case `svg`:
                    parsedUrl.mime = `image/svg+xml`
                    break;

                default:
                    break;
            }
        }
    }

    if (req.method.toLowerCase() === `options`) {
        res.statusCode = 200
        res.end()
        return
    }

    req
        .on('data', (chunk) => buffers.push(chunk))
        .on('end', () =>
            router(Buffer.concat(buffers), parsedUrl)
                .then(result => {
                    if (parsedUrl.mime) {
                        res.setHeader(`Content-type`, parsedUrl.mime)
                    }
                    res.statusCode = 200
                    res.write(convertResult(result))
                    res.end()
                })
                .catch(result => {
                    console.log(`ERROR:`, result)
                    res.statusCode = 500
                    res.write(convertResult(result))
                    res.end()
                })
        )
})