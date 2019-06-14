import path from 'path'
import { promisify } from 'util'
import importLocal from '../importLocal'

export default (code: string, { filename }: { filename: string }) => {
  const locals = {
    dir: path.dirname(filename),
    name: 'stylus'
  }
  const stylus = importLocal(locals)
  return promisify(stylus.render.bind(stylus))(code, { filename })
}
