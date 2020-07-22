module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off',
    'no-undef': 'off',
    'no-underscore-dangle': 'off',
    'no-case-declarations': 'off',
    'max-len': 'off',
    'no-mixed-operators': 'off',
    'class-methods-use-this': 'off',
    'import/extensions': 'off',
    'no-console': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
  },
};
