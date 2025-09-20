// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,                 // TS rules for .ts
  ...svelte.configs['flat/recommended'],           // Svelte + a11y rules
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        // Make <script lang="ts"> use TypeScript
        parser: tseslint.parser
      },
      globals: {
        ...globals.browser, // window, fetch, etc.
        ...globals.node,    // process, __dirname (if needed)
        ...globals.es2023
      }
    },
    rules: {
      // Typical useful TS rules in Svelte files
      '@typescript-eslint/consistent-type-imports': 'error'
    }
  },
  {
    rules: {
      // Prefer TS version of unused-vars, and ignore _-prefixed
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  prettier // turn off formatting-related ESLint rules (let Prettier own formatting)
]
