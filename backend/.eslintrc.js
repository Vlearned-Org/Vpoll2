module.exports = {
  root: true,
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ["plugin:@typescript-eslint/recommended", "prettier/@typescript-eslint", "plugin:prettier/recommended"],
  env: {
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './backendV2/tsconfig.json',
    sourceType: 'module',
  },
  rules: {
   "@typescript-eslint/ban-types": ["warn"],
    "@typescript-eslint/explicit-member-accessibility": [
      "warn",
      {
        accessibility: "explicit",
        overrides: {
          accessors: "explicit",
          constructors: "off",
          methods: "explicit",
          properties: "explicit",
          parameterProperties: "explicit"
        }
      }
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-explicit-any": "warn"
  },
  ignorePatterns: [".eslintrc.js", "**/dist/*", "**/coverage/*/", "**/node_modules/*"],
};
