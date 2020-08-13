module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true,
        'node': true,
        'mocha': true
    },
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 11
    },
    'rules': {
        'indent': [
            'error',
            4,
            { 'SwitchCase': 1 }
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        'block-spacing': [
            'error',
            'always'
        ],
        'comma-style': [
            'error',
            'last'
        ],
        'dot-location': [
            'error',
            'property'
        ],
        'no-global-assign': 'error',
        'key-spacing': [
            'error',

        ],
        'comma-spacing': [
            'error', {
                'before': false,
                'after': true
            }
        ]
    }
};