module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'array-element-newline': ['error', 'consistent'],
    curly: ['error', 'multi-line'],
    'import/order': 'off',
    'import/newline-after-import': ['error', { count: 1 }],
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'no-multi-spaces': 'error',
    'no-var': 'error',
    '@typescript-eslint/no-unused-vars': 'off',
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
      'warn',
      { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'object-curly-spacing': ['error', 'always'],
    'prefer-const': 'error',
    semi: ['error', 'never'],
    'simple-import-sort/sort': 'error',
    'sort-imports': 'off',
    'spaced-comment': ['error', 'always', { markers: ['/'], block: { balanced: true } }],
    quotes: ['error', 'single'],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'react/self-closing-comp': [
      'error',
      {
        component: true,
        html: true,
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.ts?(x)'],
      rules: {},
    },
    {
      files: 'server/**/*.js',
      rules: {
        'simple-import-sort/sort': 'off',
        'import/order': ['error', { 'newlines-between': 'always' }],
      },
    },
  ],
}
