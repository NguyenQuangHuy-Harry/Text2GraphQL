import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ---------------------------- Import ----------------------------
      // Forbid import of modules using absolute paths
      // https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/no-absolute-path.md
      "import/no-absolute-path": "error",

      // ---------------------------- React Specific Rules ----------------------------

      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
      "react/jsx-no-undef": "error",

      // Prevent usage of dangerous JSX properties
      // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger.md
      "react/no-danger": "warn",

      //https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/anchor-is-valid.md
      "jsx-a11y/anchor-is-valid": "warn",

      // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/main/docs/rules/alt-text.md
      "jsx-a11y/alt-text": "warn",

      "react-hooks/exhaustive-deps": "off",

      // ---------------------------- TypeScript Specific Rules ----------------------------
      // Detects unused variables
      // https://eslint.org/docs/latest/rules/no-unused-vars
      "@typescript-eslint/no-unused-vars": "warn",

      // ---------------------------- Other Rules ----------------------------

      // Disallow use of the 'new' operator without parentheses
      // https://eslint.org/docs/latest/rules/new-parens
      "new-parens": "error",

      // https://eslint.org/docs/latest/rules/space-in-parens
      // Require spaces inside parentheses
      "space-in-parens": "error",

      // https://eslint.org/docs/latest/rules/curly
      // Enforce curly braces for multi-line blocks
      curly: ["warn", "multi-line"],

      //https://eslint.org/docs/latest/rules/no-undef-init
      // Disallow initializing variables to 'undefined'
      "no-undef-init": "warn",

      // Disallow the use of 'var', prefer 'let' or 'const'
      // https://eslint.org/docs/latest/rules/no-var
      "no-var": "warn",

      // disallow redundant `return await`
      // https://eslint.org/docs/rules/no-return-await
      "no-return-await": "warn",

      // https://eslint.org/docs/rules/no-else-return
      "no-else-return": ["warn", { allowElseIf: false }],

      // Limit the maximum number of statements allowed per line
      "max-statements-per-line": ["error", { max: 1 }],

      // enforces return statements in callbacks of array's methods
      // https://eslint.org/docs/rules/array-callback-return
      "array-callback-return": ["warn", { allowImplicit: true }],

      // Require the use of const when declaring variables that are not reassigned
      // https://eslint.org/docs/latest/rules/prefer-const
      "prefer-const": "warn",

      // suggest using template literals instead of string concatenation
      // https://eslint.org/docs/rules/prefer-template
      "prefer-template": "warn",

      // Disable the rule disallowing template curly braces in strings
      // https://eslint.org/docs/latest/rules/no-template-curly-in-string
      "no-template-curly-in-string": "warn",

      // Warn against loose equality (==, !=) and suggest using strict equality (===, !==)
      // https://eslint.org/docs/latest/rules/eqeqeq
      eqeqeq: "warn",

      // Warn when a line exceeds 1000 characters in length
      "max-len": ["warn", { code: 360 }],

      // Disable the rule disallowing function declarations inside loops
      // https://eslint.org/docs/latest/rules/no-loop-func
      "no-loop-func": "warn",

      // Disable the rule disallowing self-assignment
      // https://eslint.org/docs/latest/rules/no-self-assign
      "no-self-assign": "warn",

      // Disable the rule disallowing escape '\' sequences in strings
      // https://eslint.org/docs/latest/rules/no-useless-escape
      "no-useless-escape": "off",

      // Disable the rule disallowing comma operator
      // https://eslint.org/docs/latest/rules/no-sequences
      "no-sequences": "off",

      // Disable the rule limiting the maximum number of lines in a file
      "max-lines": "off",

      // Disable the rule disallowing no-debugging-utils
      "testing-library/no-debugging-utils": [
        "error",
        {
          utilsToCheckFor: {
            debug: false,
            logRoles: true,
            logDOM: true,
          },
        },
      ],
    },
  },
];

export default eslintConfig;
