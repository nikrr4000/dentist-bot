import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import jest, { rules } from "eslint-plugin-jest";
import eslintPluginPrettierRecommended, { settings } from "eslint-plugin-prettier/recommended";

export default [
  {
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
    },
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
  {
    files: [
      "src/**/*.{js,mjs,cjs,ts}",
      "config/**/*.{js,mjs,cjs,ts}",
      "tests/**/*.{js,ts,jsx,tsx}",
    ],
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "module" } },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["tests/**/*.{js,ts,jsx,tsx}"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/prefer-expect-assertions": "off",
    },
  },
  eslintPluginPrettierRecommended,
];
