import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '.agents/**',
      '.aiox/**',
      '.aiox-core/**',
      '.antigravity/**',
      '.claude/**',
      '.codex/**',
      '.cursor/**',
      '.gemini/**',
      '.github/**',
      '.kimi/**',
    ],
  },
];

export default eslintConfig;
