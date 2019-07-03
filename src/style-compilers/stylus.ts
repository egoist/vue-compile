import path from 'path'
import { promisify } from 'util'
import { importLocal } from '../importLocal'

export const compile = async (code: string, { filename }: { filename: string }): Promise<string> => {
  const stylus = importLocal(path.dirname(filename), 'stylus')
  return promisify(stylus.render.bind(stylus))(code, { filename })
}
