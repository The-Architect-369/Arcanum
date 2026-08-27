// apps/web/eslint.config.mjs
// CE-W01 lint contract:
// - generated output is globally excluded
// - runtime globals are scoped by execution environment
// - React Hooks core rules are registered explicitly
// - JS/TS unused-variable reporting is non-duplicative

import js from '@eslint/js';
import { globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  globalIgnores([
    '.next/**',
    'node_modules/**',
    'dist/**',
    'build/**',
    'coverage/**',
    'out/**',
    '.vercel/**',
  ]),

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    name: 'arcanum-web-base',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  {
    name: 'arcanum-web-js-unused',
    files: ['**/*.{js,mjs,cjs,jsx}'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },

  {
    name: 'arcanum-web-ts-unused',
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  {
    name: 'arcanum-web-react-hooks',
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  {
    name: 'arcanum-web-node-runtime',
    files: [
      'node/**/*.{js,mjs,cjs}',
      'tools/**/*.{js,mjs,cjs,ts,tsx}',
    ],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  {
    name: 'arcanum-web-service-worker-runtime',
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        URL: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        self: 'readonly',
      },
    },
  },
);
