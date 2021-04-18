import { SFCTemplateBlock } from '@vue/compiler-sfc'

export const compileTemplate = <T = SFCTemplateBlock | null>(template: T): T =>
  template
