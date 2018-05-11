const path = require('path')

exports.humanlizePath = p => path.relative(process.cwd(), p)
