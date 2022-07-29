module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'jest'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier', '@appliedblockchain'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
