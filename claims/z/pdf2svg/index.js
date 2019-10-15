// http://www.cityinthesky.co.uk/opensource/pdf2svg/
// https://github.com/svg/svgo

const file = process.env.FILE

if(!file){
    throw new Error('FILE arg is required')
}

const path = require('path')
const parsed = path.parse(file)

if(parsed.ext !== `.pdf`){
    throw new Error('FILE is not a PDF')
}

const name = parsed.name
const outDirectory = `./output/${name}/`
const fs = require('fs')
const { spawn } = require('child_process')
const toSvg = spawn('pdf2svg', [file, `${outDirectory}${name}_%d.svg`, `all`])

try {
    fs.mkdirSync(outDirectory, { recursive: true })
} catch (error) {
    console.log(error)
}

toSvg.stdout.on('data', chunk => {
    console.log(Buffer.from(chunk).toString())
})

toSvg.stderr.on( 'data', chunk => {
    console.log(`stderr: ${Buffer.from(chunk).toString()}`)
})

toSvg.on('close', (code) => {
    console.log(`child process exited with code ${code}`)

    fs.readdir(outDirectory, (err, files)=>{
        if (err) {
            throw new Error(err)
        } 

        files = files.filter(f=>path.parse(f).ext === `.svg`)

        console.log(`Created ${files.length} files`)
        console.log(files)

        files.forEach(f => {
            const cleanSvg = spawn('svgo', [`${outDirectory}${f}`])

            cleanSvg.stdout.on('data', chunk => {
                console.log(Buffer.from(chunk).toString())
            })

            cleanSvg.stderr.on( 'data', chunk => {
                console.log(`stderr: ${Buffer.from(chunk).toString()}`)
            })

            cleanSvg.on('close', (code) => {
                console.log(`Cleaned ${f}`)
            })
        })
    })
})