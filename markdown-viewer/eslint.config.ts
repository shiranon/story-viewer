import comments from '@eslint-community/eslint-plugin-eslint-comments/configs'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import importX from 'eslint-plugin-import-x'
import promise from 'eslint-plugin-promise'
import * as regexp from 'eslint-plugin-regexp'
import security from 'eslint-plugin-security'
import sonarjs from 'eslint-plugin-sonarjs'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default defineConfigWithVueTs(
  // ── Ignore ──
  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    '**/public/api/**',
    'src/components/ui/*',
    'src/lib/utils.ts',
  ]),

  // ── File targets ──
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  // ── Vue ──
  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  {
    name: 'vue/custom-rules',
    rules: {
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/no-useless-mustaches': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
      'vue/prefer-separate-static-class': 'error',
      'vue/prefer-define-options': 'error',
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits', 'defineOptions', 'defineSlots', 'defineModel'],
        defineExposeLast: true,
      }],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      // Disabled: conflicts with Prettier's HTML formatting
      'vue/html-self-closing': 'off',
      'vue/no-empty-component-block': 'error',
      'vue/no-ref-object-reactivity-loss': 'error',
      'vue/no-static-inline-styles': 'error',
      'vue/padding-line-between-blocks': 'error',
      'vue/require-macro-variable-name': 'error',
      'vue/v-for-delimiter-style': ['error', 'in'],
      // multi-word requirement off for App.vue etc.
      'vue/multi-word-component-names': 'off',
    },
  },

  // ── TypeScript stylistic (strict already applied via vueTsConfigs) ──
  {
    name: 'typescript/parser-options',
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: 'typescript/custom-rules',
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'all',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-misused-promises': ['error', {
        checksVoidReturn: false,
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
    },
  },

  // ── SonarJS ──
  sonarjs.configs?.recommended as Record<string, unknown>,
  {
    name: 'sonarjs/overrides',
    rules: {
      'sonarjs/todo-tag': 'off',
    },
  },

  // ── Unicorn ──
  eslintPluginUnicorn.configs.recommended,
  {
    name: 'unicorn/overrides',
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': ['error', {
        allowList: {
          env: true,
          Env: true,
          props: true,
          Props: true,
          ref: true,
          Ref: true,
          params: true,
          Params: true,
          args: true,
          dir: true,
          Dir: true,
          el: true,
          src: true,
          Src: true,
          res: true,
          req: true,
          e: true,
        },
      }],
      'unicorn/filename-case': ['error', {
        case: 'kebabCase',
      }],
    },
  },

  // ── Tailwind CSS ──
  {
    extends: [betterTailwindcss.configs.recommended],
    settings: {
      'better-tailwindcss': {
        entryPoint: 'src/assets/main.css',
      },
    },
    rules: {
      // Disabled: conflicts with Prettier's formatting
      'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
      'better-tailwindcss/no-unknown-classes': ['error', {
        ignore: [
          // Custom CSS classes (non-Tailwind)
          'dark',
          'markdown-body',
          'markdown-list',
          'markdown-list--loose',
          'markdown-table',
          'content-panel-body',
          'content-panel-filepath',
          'message-image',
          'message-image__caption',
          'prism-code',
          // shadcn-vue theme colors not in entryPoint
          'text-destructive-foreground',
        ],
      }],
    },
  },

  // ── Comments ──
  comments.recommended,

  // ── Regexp ──
  regexp.configs['flat/recommended'],

  // ── Promise ──
  promise.configs['flat/recommended'],

  // ── Security ──
  security.configs.recommended,
  {
    name: 'security/overrides',
    rules: {
      'security/detect-object-injection': 'off',
    },
  },

  // ── Import ──
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  {
    name: 'import-x/custom-rules',
    rules: {
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/order': ['error', {
        pathGroupsExcludedImportTypes: ['builtin', 'object'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        pathGroups: [
          {
            pattern: '{vue,vue/*,vue-router,vue-router/*,pinia,pinia/*}',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '{@vueuse/**}',
            group: 'external',
            position: 'before',
          },
        ],
      }],
      // TS handles these
      'import-x/default': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'off',
      // Expensive: CI only
      'import-x/no-named-as-default': process.env.CI ? 'error' : 'off',
      'import-x/no-cycle': process.env.CI ? 'error' : 'off',
      'import-x/no-unused-modules': process.env.CI ? 'error' : 'off',
      'import-x/no-deprecated': process.env.CI ? 'error' : 'off',
    },
  },

  // ── Unused imports ──
  {
    name: 'unused-imports',
    plugins: { 'unused-imports': unusedImports },
    rules: {
      'unused-imports/no-unused-imports': process.env.CI ? 'error' : 'warn',
      'unused-imports/no-unused-vars': 'error',
    },
  },

  // ── Sort imports (member sort only, ordering handled by import-x) ──
  {
    name: 'sort-imports',
    rules: {
      'sort-imports': ['error', {
        ignoreCase: false,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: true,
      }],
    },
  },


  // ── Disable type-aware linting on JS files ──
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  // ── Prettier (must be last) ──
  skipFormatting,
)
