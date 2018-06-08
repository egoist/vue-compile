const path = require('path')
const fs = require('fs-extra')

module.exports = async (source, { filename, outFile }, api) => {
  let output

  if (filename.endsWith('.js')) {
    output = await require('./script-compilers/babel')(source.toString(), { filename })
  } else if (filename.endsWith('.ts')) {
    output = await require('./script-compilers/ts')(source.toString(), { filename })
    outFile = outFile.replace(/\.ts$/, '.js')
  } else {
    output = source
  }

  await fs.ensureDir(path.dirname(outFile))
  await fs.writeFile(outFile, output)

  api.emit('normalized', filename, outFile)
}
