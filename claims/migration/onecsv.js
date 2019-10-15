const fs = require('fs')
const path = require('path')
const csv = require('csvtojson')
const { Parser } = require('json2csv')
const dir = `takata_claims/bmw`
const output = `takata_claims/bmw.csv`

const files = fs.readdirSync(dir)
let data = []

// console.log(files)

const lookUps = {
    BMW: [`1 Series`, `2 Series`, `3 Series`, `4 Series`, `5 Series`, `6 Series`, `M760Li`, `X1`, `X3`, `X4`],
    // Subaru: [`Baja`, `Forester`, `Impreza`, `Legacy`, `Outback`, `Tribeca`, `WRX/STI`],
    // Saab: [`9-2X`]
    // Nissan: [`Maxima`, `Pathfinder`, `Sentra`, `Versa Sedan`, `Versa Hatchback`, `Altima`, `Versa Note`, `NV 200`, `NYTaxi`],
    // Infiniti: [`I30/I35`, `QX4`, ` FX35/45`, ` M35/45`, `QX56/QX80`],
    // Mazda: [`Mazda2`, `Mazda3`, `Mazda6`, `MazdaSpeed6`, `CX-7`, `CX-9`, `MPV`, `RX-8`, `B-Series`]
    // Honda: [`Pilot`, `Odyssey`, `Ridgeline`, `Element`, `Fit`, `Insight`, `CR-Z`],
    // Acura: [`CL`, `TSX`, `ILX`, `MD-X`, `RDX`, `TL/TLX`, `RL/RL-X`, `ZD-X`, `FCX`]
    // Ford: [`Edge`, `Fusion`, `GT`, `Mustang`, `Ranger`],
    // Lincoln: [`MKC`, `MKX`, `MKZ`, `Zephyr`],
    // Mercury: [`Milan`]
    // Toyota: [`Corolla`, `Matrix`, `RAV4`, `Sequoia`, `Sienna`, `Tundra`, `Yaris`, `4Runner`, `iM`,],
    // Lexus: [`ES350`, `GX460`, `IS`, ` IS-F`, `IS250/350`, `IS250C/350C`, `IS350/300/200T`]
}


Promise.all(files.map(file => {
    return csv()
        .fromFile(path.join(dir, file))
        .then(obj => {
            return Promise.all(
                obj.map(_obj => {
                    let found
                    Object.keys(lookUps).forEach(lookUpKey => {
                        if (lookUpKey.toLowerCase() === _obj.make.toLowerCase()) {
                            lookUps[lookUpKey].forEach(key => {
                                if (key.toLowerCase().indexOf(_obj.model.toLowerCase()) > -1) {
                                    _obj[`${lookUpKey}_${key}_${_obj.year}`] = `x`
                                    found = true
                                }
                            })
                        }
                    })

                    // if (!found && _obj.model === `COROLLA iM`) {
                    //     _obj[`Toyota_iM_${_obj.year}`] = `x`
                    //     found = true
                    // }

                    // if (!found && _obj.model === `MDX`) {
                    //     _obj[`Acura_MD-X_${_obj.year}`] = `x`
                    //     found = true
                    // }

                    if (!found) {
                        console.log(_obj)
                        return false
                    }

                    data.push(_obj)
                    return _obj
                }).filter(o => !!o)
            )
        })
}))
    .then(() => {
        // console.log(data)
        const fields = []
        data.forEach(claim => {
            Object.keys(claim).forEach(f => fields.indexOf(f) === -1 ? fields.push(f) : undefined)
        })

        const opts = { fields, flatten: true }

        try {
            const parser = new Parser(opts)
            const csv = parser.parse(data)
            fs.writeFileSync(output, csv)
            process.exit()
        } catch (err) {
            console.error(err)
            process.exit()
        }
    })