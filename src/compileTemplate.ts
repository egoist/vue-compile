import { SFCBlock } from '@vue/component-compiler-utils'

export const compileTemplate = <T = SFCBlock | null>(template: T): T => template
