module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'prettier',
    'prettier/react',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    'array-element-newline': ['error', 'consistent'],
    curly: ['error', 'multi-line'],
    'import/order': 'off',
    'import/newline-after-import': ['error', { count: 1 }],
    'lines-between-class-members': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'no-multi-spaces': 'error',
    'no-var': 'error',
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
