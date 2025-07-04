import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
    },
    settings: {
      react: {
        version: "detect", // ✅ fixes "React must be in scope" for JSX
      },
    },
    rules: {
      // ✅ Base recommended rules
      ...js.configs.recommended.rules,
      ...pluginReact.configs.recommended.rules,

      // ✅ ZAP-focused comment detection
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme", "hardcoded", "password", "secret", "debug", "ip"],
          location: "anywhere",
        },
      ],

      // ✅ Disable non-security warnings
      "react/prop-types": "off",
      "react/no-unescaped-entities": "off",
      "no-unused-vars": "off",

      // ✅ Fix CRA/React 17 JSX import issue
      "react/react-in-jsx-scope": "off",
    },
  },
];
