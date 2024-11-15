import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: [
			"**/node_modules",
			"**/.gitignore"
		],
	},
	...fixupConfigRules(
		compat.extends(
			"eslint:recommended",
			"plugin:@typescript-eslint/recommended"
		)
	),
	{

		languageOptions: {
			parser: tsParser,
			ecmaVersion: 12,
			sourceType: "module",

		},

		rules: {
			indent: [
				"warn",
				"tab",
				{
					SwitchCase: 1,
				},
			],

			"no-case-declarations": "off",
			"array-bracket-spacing": [ "warn", "always" ],
			quotes: [ "warn", "double" ],

			"object-curly-spacing": [
				"warn",
				"always",
				{
					objectsInObjects: false,
					arraysInObjects: false,
				},
			],

			semi: "warn",
			"comma-dangle": [ "warn", "only-multiline" ],
			"array-bracket-newline": [ "warn", "consistent" ],
			"comma-spacing": "warn",
			"template-curly-spacing": [ "warn", "always" ],
			eqeqeq: [ "warn", "always" ],
			"semi-spacing": "warn",
			"max-statements-per-line": "warn",
			"space-in-parens": "warn",
			"space-infix-ops": "warn",
			"keyword-spacing": "warn",
			"space-before-function-paren": [ "warn", "never" ],
			"key-spacing": "warn",

			"no-trailing-spaces": [
				"warn",
				{
					ignoreComments: true,
					skipBlankLines: true,
				},
			],

			"arrow-parens": [ "warn", "as-needed" ],
			"func-call-spacing": "warn",
			"no-mixed-spaces-and-tabs": [ "warn" ],

			"no-multiple-empty-lines": [
				"warn",
				{
					max: 1,
					maxBOF: 0,
				},
			],

			"no-regex-spaces": "warn",
			"no-multi-spaces": "warn",
			"space-unary-ops": "warn",

			"lines-around-comment": [
				"warn",
				{
					beforeBlockComment: true,
					beforeLineComment: true,
					afterBlockComment: false,
					afterLineComment: false,
					allowBlockStart: false,
					allowBlockEnd: false,
				},
			],

			"no-whitespace-before-property": "warn",

			"spaced-comment": [
				"warn",
				"always",
				{
					line: {
						markers: [ "/" ],
						exceptions: [ "-", "+" ],
					},

					block: {
						markers: [ "!" ],
						exceptions: [ "*" ],
						balanced: true,
					},
				},
			],

			"computed-property-spacing": "warn",
			"rest-spread-spacing": "warn",
			"function-call-argument-newline": [ "warn", "consistent" ],
			"nonblock-statement-body-position": "warn",
			"space-before-blocks": "warn",
			"no-dupe-args": "warn",
			"no-dupe-else-if": "warn",
			"brace-style": "warn",
			"no-undef": "off",
			"no-prototype-builtins": "off",
			"no-unused-vars": "off",
			"no-fallthrough": "off",
			"no-empty": "off",
			"@typescript-eslint/no-unused-vars": "warn",
		}
	},
];
