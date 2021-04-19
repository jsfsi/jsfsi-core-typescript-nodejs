// Note: I prefer using a JavaScript file for the .eslintrc file (instead of a JSON file)
// as it supports comments that can be used to better describe rules.
module.exports = {
  parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    'plugin:security-node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
    sourceType: 'module',  // Allows for the use of imports
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports', 'security-node'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_*' }],
    'unused-imports/no-unused-imports-ts': 'error',
    'unused-imports/no-unused-vars-ts': [
        'warn',
        { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' },
    ],
    'eol-last': ['error', 'always'],
    'import/default': 'error',
    'import/dynamic-import-chunkname': 'off',
    'import/export': 'error',
    'import/exports-last': 'off',
    'import/first': 'error',
    'import/group-exports': 'off',
    'import/imports-first': 'error',
    'import/max-dependencies': 'off',
    'import/named': 'error',
    'import/namespace': 'error',
    'import/newline-after-import': 'error',
    'import/no-absolute-path': 'error',
    'import/no-amd': 'error',
    'import/no-anonymous-default-export': 'off',
    'import/no-commonjs': 'off',
    'import/no-cycle': 'off',
    'import/no-default-export': 'off',
    'import/no-deprecated': 'off',
    'import/no-duplicates': 'error',
    'import/no-dynamic-require': 'off',
    'import/no-internal-modules': 'off',
    'import/no-mutable-exports': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-named-default': 'off',
    'import/no-named-export': 'off',
    'import/no-namespace': 'off',
    'import/no-nodejs-modules': 'off',
    'import/no-relative-parent-imports': 'off',
    'import/no-restricted-paths': 'off',
    'import/no-self-import': 'error',
    'import/no-unassigned-import': 'off',
    'import/no-unused-modules': 'off',
    'import/no-useless-path-segments': 'error',
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index'
        ],
      }
    ],
    'import/prefer-default-export': 'off',
    'import/unambiguous': 'off',
    'security-node/detect-eval-with-expr': 'error',
    'security-node/non-literal-reg-expr': 'error',
    'security-node/detect-absence-of-name-option-in-exrpress-session': 'error',
    'security-node/detect-buffer-unsafe-allocation': 'error',
    'security-node/detect-child-process': 'error',
    'security-node/detect-crlf': 'error',
    'security-node/detect-dangerous-redirects': 'error',
    'security-node/detect-html-injection': 'error',
    'security-node/detect-insecure-randomness': 'error',
    'security-node/detect-non-literal-require-calls': 'error',
    'security-node/detect-nosql-injection': 'error',
    'security-node/detect-option-multiplestatements-in-mysql': 'error',
    'security-node/detect-option-rejectunauthorized-in-nodejs-httpsrequest': 'error',
    'security-node/detect-option-unsafe-in-serialize-javascript-npm-package': 'error',
    'security-node/detect-possible-timing-attacks': 'error',
    'security-node/detect-runinthiscontext-method-in-nodes-vm': 'error',
    'security-node/detect-security-missconfiguration-cookie': 'error',
    'security-node/detect-sql-injection': 'error',
  },
};
