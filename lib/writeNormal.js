const fs = require('fs-extra')

module.exports = async (code, { filename, outFile }, api) => {
  let output

  if (filename.endsWith('.js')) {
    output = await require('./script-compilers/babel')(code, { filename })
  } else if (filename.endsWith('.ts')) {
    output = await require('./script-compilers/ts')(code, { filename })
    outFile = outFile.replace(/\.ts$/, '.js')
  } else {
    output = code
  }

  await fs.writeFile(outFile, output, 'utf8')

  api.emit('normalized', filename, outFile)
}
