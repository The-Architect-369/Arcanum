import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "arcanum-site",
    plugins: { "@next/next": nextPlugin, "react-hooks": reactHooks },
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
    },
    ignores: [".next/**", "node_modules/**", "dist/**", "build/**"],
  }
);
