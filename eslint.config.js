import js from '@eslint/js';
import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-config-prettier';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      sonarjs,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      ...sonarjs.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  {
    files: ['playwright.config.js', 'tests-e2e/**/*.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
];
