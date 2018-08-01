module.exports = {
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "semi-style": ["error", "last"],
        "indent": ["error", 4],
        "quotes": ["error", "double"],
        "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
        "block-scoped-var": "error",
        "block-spacing": ["error", "always"],
        "semi-spacing": ["error", {"before": false, "after": true}],
        "space-in-parens": ["error", "never"],
        "comma-style": ["error", "last"],
        "comma-dangle": ["error", "never"],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "func-call-spacing": "error",
        "function-paren-newline": ["error", "never"],
        "space-before-function-paren": ["error", {
            "anonymous": "always",
            "named": "always",
            "asyncArrow": "always"
        }],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": ["error", {"int32Hint": false}],
        "switch-colon-spacing": ["error", {"after": true, "before": false}],
        "no-trailing-spaces": "error",
        "multiline-ternary": ["error", "never"],
        "curly": ["error", "all"],
        "object-curly-newline": ["error", { "consistent": true }],
        "template-tag-spacing": ["error", "never"],
        "no-multiple-empty-lines": ["error", {"max": 2}],
        "no-useless-escape": "error",
        "strict": ["off", "safe"],
        "no-use-before-define": ["error", { "variables": false, "functions": true, "classes": true }],
        "no-shadow": ["error", { "builtinGlobals": false, "hoist": "functions", "allow": ["resolve", "reject", "done", "cb"] }],
        "no-shadow-restricted-names": "error",
        "no-console": "off",
        "no-var": "error",
        "semi": "error",
        "no-extra-semi": "error",
        "no-alert": "error",
        "no-debugger": "error",
        "no-return-await": "error",
        "complexity": ["error", 20],
        "array-callback-return": "error",
        "no-eq-null": "error",
        "max-classes-per-file": ["error", 1],
        "class-methods-use-this": ["error", { "exceptMethods": [] }],
        "no-loop-func": "error",
        "default-case": "error",
        "no-magic-numbers": ["error", { "ignoreArrayIndexes": true, "ignore": [-1, 0, 1] }],
        "prefer-object-spread": "error",
        "id-blacklist": ["error", "i", "j", "k", "o"], //fill in here...
        "valid-jsdoc": ["off", {
            "requireReturn": false,
            "prefer": {
                "arg": "param",
                "argument": "param",
                "returns": "return"
            },
            "preferType": {
                "Boolean": "boolean",
                "Number": "number",
                "String": "string",
                "object": "Object",
                "array": "Array"
            }
        }]
    },
    "env": {
        "browser": true,
        "es6": true
    },
    "plugins": [
        "html",
        "json"
    ],
    "globals": {
        "customElements": true,
        "HTMLImports": true,
        "Polymer": true,
        "ShadyDOM": true,
        "ShadyCSS": true,
        "JSCompiler_renameProperty": true,
        "DataHelper": true,
        "Globals": true,
        "RUFBehaviors": true,
        "ContextHelper": true,
        "ConstantHelper": true,
        "ComponentHelper": true,
        "RUFUtilities": true,
        "LocaleManager": true,
        "EntityTypeManager": true,
        "_": true
    }
};