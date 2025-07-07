import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React specific rules
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      
      // General JavaScript rules
      'no-console': 'off',
      'no-undef': 'off', // TypeScript handles this
      'no-prototype-builtins': 'off',
      'no-fallthrough': 'warn',
      'no-empty': 'warn',
      'no-cond-assign': 'warn',
      'no-constant-condition': 'warn',
      'no-useless-escape': 'warn',
      'no-control-regex': 'warn',
      'valid-typeof': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      
      // Stricter rules for production code quality
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'warn',
      'curly': ['error', 'multi-line'],
    },
  },
  {
    ignores: [
      'dist/',
      'build/',
      '.react-router/',
      'node_modules/',
      '*.config.js',
      '*.config.ts',
      'coverage/',
      '.wrangler/',
      'public/',
      'generated/',
    ],
  },
  prettierConfig,
);