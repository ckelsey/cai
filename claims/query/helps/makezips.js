const zipJSON = require('./zips.json')
const zips = {}
zipJSON.forEach(zip => zips[zip.zipcode] = zip)

require('fs').writeFileSync('zipcodeData.json', JSON.stringify(zips))