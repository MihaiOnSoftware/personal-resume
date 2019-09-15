// .eslintrc.js
module.exports = {
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: 6
  },
  env: {
    browser: true,
    node: true
  },
  rules: {
    "comma-dangle": ["error", "always-multiline"]
  },
  globals: { Promise: true }
};
