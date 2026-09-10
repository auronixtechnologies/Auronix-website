/**
 * ESLint config. `npm run lint` previously failed outright — the script
 * existed but neither ESLint nor a config was installed.
 *
 * Kept deliberately close to the recommended presets: the goal is catching
 * real mistakes (unused variables, missing hook dependencies, broken JSX),
 * not enforcing a formatting opinion.
 */
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  plugins: ['react-refresh'],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs'],
  rules: {
    // Vite's fast refresh only works when a module exports components alone.
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // Unused variables are almost always a leftover; allow the _prefix escape
    // hatch for intentionally ignored callback arguments.
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

    // console.error/warn are legitimate for surfacing failures; bare
    // console.log is debugging residue that should not ship.
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    eqeqeq: ['warn', 'smart'],

    // Off deliberately. The project does not use PropTypes anywhere, so this
    // rule fires on every component and would mean ~40 boilerplate
    // declarations that document nothing the JSX does not already show.
    // TypeScript is the real answer if prop contracts become worth enforcing.
    'react/prop-types': 'off',

    // Off deliberately. Apostrophes and quotes in prose are valid JSX text;
    // escaping them hurts readability for no rendering benefit.
    'react/no-unescaped-entities': 'off',
  },
};
