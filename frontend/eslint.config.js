import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import tsParser from '@typescript-eslint/parser'

export default [
  {
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/styles/**', 'src/mocks/**', 'src/tests/**'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: { vue: vuePlugin },
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message: 'Hex literals are forbidden outside styles/tokens.css and mocks/fixtures.ts. Use CSS variables.',
        },
      ],
    },
  },
]
