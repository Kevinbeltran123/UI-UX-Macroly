import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // WCAG 2.1 AA — catches missing alt, label, role, and keyboard issues at lint time.
  // Plugin already registered by eslint-config-next; only inject the rule set.
  { rules: jsxA11y.flatConfigs.recommended.rules },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code agent worktrees — not part of the project source:
    ".claude/**",
    // Legacy prototype scripts — not part of the Next.js app:
    "prototipo-legacy/**",
  ]),
]);

export default eslintConfig;
