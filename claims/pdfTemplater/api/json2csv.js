const states = {}
const _states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}

Object.keys(_states).forEach(k => states[_states[k].toLowerCase()] = k)

const fs = require('fs')
const { Parser } = require('json2csv')

const writeCSV = (fields, obj, filePath) => {
    const opts = { fields }

    try {
        const parser = new Parser(opts)
        const csv = parser.parse(obj)
        fs.writeFileSync(filePath, csv)
        process.exit()
    } catch (err) { console.error(err) }
}

const f = []
const file = JSON.parse(fs.readFileSync(`S0048_purchase_state.json`))

file.forEach(element => {
    if (!!element.purchase_state && element.purchase_state.length > 2) {
        element.purchase_state = states[element.purchase_state.toLowerCase()] || ``
    }
    Object.keys(element).forEach(k => f.indexOf(k) === -1 ? f.push(k) : undefined)
})

writeCSV(f, file, `S0048_purchase_state.csv`)