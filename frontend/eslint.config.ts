import js from '@eslint/js';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      pluginReact.configs.flat.recommended,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort, // 플러그인 추가
    },
    rules: {
      // 1. React Hooks & Refresh 규칙
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off',

      // 2. Simple Import Sort 규칙 (요청하신 순서 적용)
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // --------------------------------------------------------
            // 1. React 관련 패키지
            // --------------------------------------------------------
            ['^react$', '^react-dom', '^react/'],

            // --------------------------------------------------------
            // 2. 외부 라이브러리 (node_modules)
            // @/ 로 시작하지 않는 모든 외부 패키지
            // --------------------------------------------------------
            ['^@(?![/])', '^[^@.\\0]'],

            // --------------------------------------------------------
            // 3. 내부 코드 1 (UI 관련: 컴포넌트, 훅, 상태, 페이지)
            // --------------------------------------------------------
            ['^@/(components|hooks|contexts|stores|pages)(/.*|$)'],

            // --------------------------------------------------------
            // 4. 내부 코드 2 (로직 관련: API, 타입, 유틸, 상수, 설정)
            // --------------------------------------------------------
            ['^@/(api|types|utils|constants|config|styles)(/.*|$)'],

            // --------------------------------------------------------
            // 5. 상대 경로 (./, ../)
            // --------------------------------------------------------
            [
              '^\\.\\.(?!/?$)',
              '^\\.\\./?$',
              '^\\./(?=.*/)(?!/?$)',
              '^\\.(?!/?$)',
              '^\\./?$',
            ],

            // 6. 사이드 이펙트 import (css 등)
            ['^\\u0000'],
          ],
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
);
