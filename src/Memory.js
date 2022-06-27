const KEY_REGEXP = /^\$(.+?)(\((.*)\))?$/;
const PARSE_STRING_REGEXP = /({\$.+?})/g;
const PARAMS_SPLIT_REGEXP = /\s*,\s*/;
const QUOTES_REPLACE_REGEXP = /^['"]|['"]$/g;
const STRING_TYPE_REGEXP = /^'.+'|".+"$/;
const NUMBER_TYPE_REGEXP = /^\d+|\d+\.\d+$/;

class Memory {

    /**
     * Get value from memory
     * @param {string} str - string to resolve
     * @returns {any} - resolved value
     * @example const value = memory.getValue('$val');
     */
    getValue(str) {
        if (KEY_REGEXP.test(str)) return this.getKey(str)
        if (PARSE_STRING_REGEXP.test(str)) return this.getString(str)
        return str
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
        const keyMatch = str.match(KEY_REGEXP);
        const key = keyMatch ? keyMatch[1] : null;
        if (key) {
            const value = this.getProperty(key);
            if (typeof value === 'function') {
                const params = this.getComputedParams(str);
                return value.apply(null, params)
            }
            return value
        }
    }

    /**
     * Resolve object
     * @private
     * @param {string} key - key to resolve
     * @returns {any} - resolved value
     */
    getProperty(key) {
        const props = key.replace(/]/g, '').split(/[[.]/).map(prop => prop.replace(QUOTES_REPLACE_REGEXP, ''));
        const obj = this[props.shift()];
        if (obj === undefined) throw new Error(`${key} is not found in memory`);
        return props.reduce((value, prop) => value[prop], obj)
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
     * @returns {Array<string>} - array of params
     */
    getComputedParams(str) {
        const paramsString = str.match(KEY_REGEXP);
        if (!(paramsString && paramsString[3])) return []
        const params = paramsString[3].split(PARAMS_SPLIT_REGEXP);
        return params.map(p => {
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
}

module.exports = new Memory();
