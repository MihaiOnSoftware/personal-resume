const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                Promise: "readonly",
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly",
                global: "readonly",
                window: "readonly",
                document: "readonly",
                fetch: "readonly",
                setTimeout: "readonly",
            },
        },
        rules: {
            "comma-dangle": ["error", "always-multiline"],
        },
    },
    {
        files: ["test/**/*.js"],
        plugins: {
            jest: require("eslint-plugin-jest"),
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                describe: "readonly",
                test: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                jest: "readonly",
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                exports: "readonly",
                global: "readonly",
                fetch: "readonly",
            },
        },
        rules: {
            ...require("eslint-plugin-jest").configs.recommended.rules,
            "comma-dangle": ["error", "always-multiline"],
            "jest/expect-expect": [
                "error",
                {
                    "assertFunctionNames": [
                        "expect",
                        "expectGitHubApiCalled",
                        "expectSystemMessageContains"
                    ]
                }
            ],
        },
    },
]; 