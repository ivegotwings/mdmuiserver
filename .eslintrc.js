module.exports = {
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module"
    },
    "rules": {
        "no-var": "error",
        "no-undef": "error",
        "semi-style": ["off", "last"],
        "indent": ["off", 4],
        "quotes": ["off", "double"],
        "brace-style": ["off", "1tbs", { "allowSingleLine": false }],
        "block-scoped-var": "off",
        "block-spacing": ["off", "always"],
        "semi-spacing": ["off", {"before": false, "after": true}],
        "space-in-parens": ["off", "never"],
        "comma-style": ["off", "last"],
        "comma-dangle": ["off", "never"],
        "comma-spacing": ["off", { "before": false, "after": true }],
        "func-call-spacing": "off",
        "function-paren-newline": ["off", "never"],
        "space-before-function-paren": ["off", {
            "anonymous": "always",
            "named": "always",
            "asyncArrow": "always"
        }],
        "space-in-parens": ["off", "never"],
        "space-infix-ops": ["off", {"int32Hint": false}],
        "switch-colon-spacing": ["off", {"after": true, "before": false}],
        "no-trailing-spaces": "off",
        "multiline-ternary": ["off", "never"],
        "curly": ["off", "all"],
        "object-curly-newline": ["off", { "consistent": true }],
        "template-tag-spacing": ["off", "never"],
        "no-multiple-empty-lines": ["off", {"max": 2}],
        "no-useless-escape": "off",
        "strict": ["off", "safe"],
        "no-use-before-define": ["off", { "variables": false, "functions": true, "classes": true }],
        "no-shadow": ["off", { "builtinGlobals": false, "hoist": "functions", "allow": ["resolve", "reject", "done", "cb"] }],
        "no-shadow-restricted-names": "off",
        "no-console": "off",
        "no-unused-vars": "off",
        "semi": "off",
        "no-extra-semi": "off",
        "no-alert": "off",
        "no-debugger": "error",
        "no-return-await": "off",
        "complexity": ["off", 20],
        "array-callback-return": "off",
        "no-eq-null": "off",
        "no-control-regex":"off",
        "max-classes-per-file": ["off", 1],
        "class-methods-use-this": ["off", { "exceptMethods": [] }],
        "no-loop-func": "off",
        "default-case": "off",
        "no-magic-numbers": ["off", { "ignoreArrayIndexes": true, "ignore": [-1, 0, 1] }],
        "prefer-object-spread": "off",
        "id-blacklist": ["off", "i", "j", "k", "o", "h"], //fill in here...
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
        "ArrayDataSource": true,
        "DataHelper": true,
        "globalFunctions": true,
        "globalPubSubInstances": true,
        "RUFBehaviors": true,
        "RUFEventHandlers": true,
        "AttributeHelper": true,
        "Base64": true,
        "ContextHelper": true,
        "ConstantHelper": true,
        "ComponentHelper": true,
        "ContentTypeHelper": true,
        "ContentTypeUtils": true,
        "ContextModelManager": true,
        "DataObjectFalcorUtil": true,
        "DataMergeHelper": true,
        "DomainManager": true,
        "EntityHelper": true,
        "falcor": true,
        "FormatHelper": true,
        "DataRequestHelper": true,
        "DataTransformHelper": true,
        "ValidationHelper": true,
        "MessageHelper": true,
        "NavigationManager": true,
        "io": true,
        "IntlMessageFormat": true,
        "module": true,
        "moment": true,
        "LiquidDataObjectUtils": true,
        "LiquidResponseHelper": true,
        "ElementHelper": true,
        "queryParser": true,
        "RUFUtilities": true,
        "RuntimeVersionManager": true,
        "ModuleVersionManager": true,
        "LocaleManager": true,
        "EntityTypeManager": true,
        "ContextDataManager":true,
        "EntityCompositeModelManager": true,
        "SharedUtils": true,
        "SharedEnumsUtil": true,
        "SecurityContextHelper": true,
        "saulis": true,
        "Quill": true,
        "d3": true,
        "require": true,
        "process": true,
        "isEmpty": true,
        "Buffer": true,
        "exports": true,
        "_": true,
        "log4javascript": true,
        "DataTableRow": true,
        "PebbleToast": true,
        "PebbleDialog": true,
        "AppBusinessFunction": true,
        "ProgressTracker": true,
        "FileDownloadManager": true
    }
};