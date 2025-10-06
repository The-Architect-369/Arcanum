import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "arcanum-site",
    plugins: { "@next/next": nextPlugin },
    rules: {
      // App Router projects often disable this old pages-dir rule
      "@next/next/no-html-link-for-pages": "off",
      "no-unused-vars": "warn"
    },
    ignores: [".next/**","node_modules/**","dist/**","build/**"]
  }
);