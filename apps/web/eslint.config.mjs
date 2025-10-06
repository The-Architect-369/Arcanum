// apps/web/eslint.config.mjs
// Minimal flat-config for Next 15 + TypeScript.
// Keeps Next's build happy without pulling in legacy @eslint/eslintrc.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: 'arcanum-web',
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**'
    ],
    rules: {
      // keep it chill; raise as needed
      'no-unused-vars': 'warn'
    }
  }
);
