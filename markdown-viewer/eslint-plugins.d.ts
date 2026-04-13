declare module 'eslint-plugin-promise' {
  import type { Linter } from 'eslint'

  const plugin: {
    configs: Record<string, Linter.Config | Linter.Config[]>
  }
  export default plugin
}

declare module 'eslint-plugin-security' {
  import type { Linter } from 'eslint'

  const plugin: {
    configs: Record<string, Linter.Config | Linter.Config[]>
  }
  export default plugin
}

declare module '@eslint-community/eslint-plugin-eslint-comments/configs' {
  import type { Linter } from 'eslint'

  const configs: Record<string, Linter.Config>
  export default configs
}
