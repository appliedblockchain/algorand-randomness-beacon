module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', '@appliedblockchain'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'array-bracket-spacing': ['error', 'never'],
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-mixed-operators': ['off'],
  }
}
