import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  js.configs.recommended,

  // Next.js ESLint Presets (kompatibel gemacht für Flat Config)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignores
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
