module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    // Required for Foundry compatibility
    'no-underscore-dangle': 'off',
    'no-undef': 'off',
    'import/extensions': 'off',
    'class-methods-use-this': ['error', {
      exceptMethods: ['getData', '_updateObject'],
    }],
    // Personal Preference
    'linebreak-style': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': 'off',
  },
};
