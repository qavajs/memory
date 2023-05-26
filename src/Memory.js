const KEY_REGEXP = /^\$(.+?)(\((.*)\))?$/;
const PARAMS_REGEXP = /^(.+?)(\((.*)\))?$/;
const ESCAPED_REGEXP = /^\\\$/;
const PARSE_STRING_REGEXP = /({\$.+?})/g;
const QUOTES_REPLACE_REGEXP = /^['"]|['"]$/g;
const STRING_TYPE_REGEXP = /^'.*'|".*"$/;
const NUMBER_TYPE_REGEXP = /^\d+|\d+\.\d+$/;

class Memory {

    /**
     * Get value from memory
     * @param {string} str - string to resolve
     * @returns {any} - resolved value
     * @example const value = memory.getValue('$val');
     */
    getValue(str) {
        if (ESCAPED_REGEXP.test(str)) return str.replace('\\$', '$');
        if (KEY_REGEXP.test(str)) return this.getKey(str);
        if (PARSE_STRING_REGEXP.test(str)) return this.getString(str);
        return str;
    }

    /**
     * Set value in memory
     * @param {string} key - key to store
     * @param {any} value - value to store
     * @example memory.setValue('value', 42);
     */
    setValue(key, value) {
        this[key] = value;
    }

    /**
     * Get key from memory
     * @private
     * @param {string} str - key to resolve
     * @returns {any} - resolved value
     */
    getKey(str) {
        const props = this.parseChain(str);
        props[0] = props[0].replace(/^\$/, '');
        const traverse = props.reduce((prev, prop) => {
            const ctx = prev.value;
            const key = prop.replace(/\((.*)\)/, '');
            let value = ctx[key];
            if (value === undefined) throw new Error(`${str}\n'${key}' is not defined`);
            if (typeof value === 'function' && prop.includes('(') && prop.includes(')')) {
                const params = this.getComputedParams(prop);
                value = value.apply(ctx, params)
            }
            return {value, ctx}
        }, {value: this, ctx: null});
        return traverse.value
    }

    /**
     * Resolve string with interpolation
     * @private
     * @param {string} str - string to resolve
     * @returns {string} - resolved string
     */
    getString(str) {
        const matches = str.match(PARSE_STRING_REGEXP).map(match => match.replace(/{|}/g, ``));
        return matches.reduce((string, variable) => string.replace(`{${variable}}`, this.getKey(variable)), str);
    }

    /**
     * Extract arguments for computed function
     * @private
     * @param {string} str - string with params
     * @returns {Array<any>} - array of params
     */
    getComputedParams(str) {
        const paramsString = str.match(PARAMS_REGEXP);
        if (!(paramsString && paramsString[3])) return []
        const params = [];
        let singleQuoteClosed = true;
        let doubleQuoteClosed = true;
        let param = '';
        for (const char of paramsString[3]) {
            if (char === `'` && doubleQuoteClosed) singleQuoteClosed = !singleQuoteClosed;
            if (char === `"` && singleQuoteClosed) doubleQuoteClosed = !doubleQuoteClosed;
            if (char === `,` && singleQuoteClosed && doubleQuoteClosed) {
                params.push(param);
                param = '';
            } else {
                param += char;
            }
        }
        if (param !== '') params.push(param)
        return params.map(p => p.trim()).map(p => {
            if (STRING_TYPE_REGEXP.test(p)) return p.replace(QUOTES_REPLACE_REGEXP, '')
            if (NUMBER_TYPE_REGEXP.test(p)) return parseFloat(p)
            if (KEY_REGEXP.test(p)) return this.getValue(p)
        })
    }

    /**
     * Register memory object
     * @param obj - object to register
     */
    register(obj) {
        for (const prop in obj) {
            this[prop] = obj[prop];
        }
    }

    parseChain(chain) {
        const tokens = [];
        let currentToken = '';
        let insideSquareBracket = false;
        let insideParenthesis = 0;

        for (let i = 0; i < chain.length; i++) {
            const char = chain.charAt(i);

            if (char === '.' && !insideSquareBracket && !insideParenthesis) {
                tokens.push(currentToken);
                currentToken = '';
            } else if (char === '[' && !insideParenthesis) {
                insideSquareBracket = true;
                tokens.push(currentToken);
                currentToken = '';
            } else if (char === ']' && !insideParenthesis && insideSquareBracket) {
                insideSquareBracket = false;
                tokens.push(currentToken);
                currentToken = '';
            } else {
                if (char === '(') {
                    insideParenthesis++;
                } else if (char === ')') {
                    insideParenthesis--;
                }
                currentToken += char;
            }
        }

        if (currentToken !== '') {
            tokens.push(currentToken);
        }

        return tokens.filter(token => token).map(token => token.replace(QUOTES_REPLACE_REGEXP, ''));
    }

}

module.exports = new Memory();
