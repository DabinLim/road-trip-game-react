module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'airbnb/hooks',
    'airbnb-typescript',
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'react/require-default-props': 'off',
    'react/jsx-indent': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'function-paren-newline': 'off',
    'no-nested-ternary': 'off',
    'no-param-reassign': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    'consistent-return': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
};
