import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  {
    // Generated output only. `worker-configuration.d.ts` is produced by
    // `npm run types:worker` and inlines the whole workerd runtime, so linting
    // it reports hundreds of false positives against Wrangler's own code.
    ignores: [
      'dist',
      'dist-server',
      'dist-worker',
      'node_modules',
      '.audit',
      '.wrangler',
      'worker-configuration.d.ts',
      // The superseded Next.js app, its static-export output and its PostCSS /
      // Tailwind 3 / ESLint config. Kept verbatim as the record of the site that
      // was audited, but not part of this project's source. See
      // docs/FINAL_IMPLEMENTATION_REPORT.md.
      'legacy-static-export',
      'components.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Build scripts and config files run in Node, not the browser.
    files: ['**/*.mjs', '**/*.cjs', '*.config.{js,ts,mjs}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
