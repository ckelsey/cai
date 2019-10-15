const REGION = process.env.REGION || `us-east-1`
const SOURCEBUCKET = process.env.SOURCEBUCKET || `cai-filing`
const AWS = require("aws-sdk")
const S3 = new AWS.S3({ signatureVersion: 'v4', region: REGION })
const Lambda = new AWS.Lambda()

const getSourceKey = path => path.split(`s3.amazonaws.com/`)[1]

const getS3File = async (path) => {
    const params = {
        Bucket: SOURCEBUCKET,
        Key: getSourceKey(path)
    }

    return await S3.getObject(params)
        .promise()
        .then(res => res.Body.toString())
}

const invokeRenderer = async (data) => await Lambda.invoke({
    FunctionName: `CAI-Filing-Export-Render`,
    Payload: JSON.stringify(data)
}).promise()

exports.handler = async (event) => {
    const respond = (err, result) => {
        const response = {
            statusCode: err ? 400 : 200,
            body: JSON.stringify(err || result),
        };
        return response
    }

    if (event.body === null && event.body === undefined) {
        return respond(`Invalid data`)
    }

    try {
        const body = JSON.parse(event.body)
        const name = body.name
        const queries = body.query
        const styles = body.styles
        const pages = body.pages
        const svgs = await Promise.all(pages.map(page => getS3File(page.file)))
        // const renderings = await Promise.all(
        //     queries.map(
        //         query => invokeRenderer({
        //             styles,
        //             svgs,
        //             pages,
        //             query,
        //             name
        //         })
        //     )
        // )

        const renderings = await invokeRenderer({
            styles,
            svgs,
            pages,
            query: queries[0],
            name
        })

        return respond(undefined, renderings)
    } catch (error) {
        return respond(error)
    }
}
