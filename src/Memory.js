const KEY_REGEXP = /^\$(.+?)(\((.*)\))?$/;
const PARSE_STRING_REGEXP = /({\$.+?})/g;
const PARAMS_SPLIT_REGEXP = /\s*,\s*/;
const QUOTES_REPLACE_REGEXP = /^['"]|['"]$/g;
const STRING_TYPE_REGEXP = /^'.+'|".+"$/;
const NUMBER_TYPE_REGEXP = /^\d+|\d+\.\d+$/;

class Memory {

    getValue(str) {
        if (KEY_REGEXP.test(str)) return this.getKey(str)
        if (PARSE_STRING_REGEXP.test(str)) return this.getString(str)
        return str
    }

    setValue(key, value) {
        this[key] = value;
    }

    getKey(str) {
        const keyMatch = str.match(KEY_REGEXP);
        const key = keyMatch ? keyMatch[1] : null;
        if (key) {
            if (!(key in this)) throw new Error(`${key} is not found in memory`);
            if (typeof this[key] === 'function') {
                const params = this.getComputedParams(str);
                return this[key].apply(null, params)
            }
            return this[key]
        }
    }

    getString(str) {
        const matches = str.match(PARSE_STRING_REGEXP).map(match => match.replace(/{|}/g, ``));
        return matches.reduce((string, variable) => string.replace(`{${variable}}`, this.getKey(variable)), str);
    }

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

    register(obj) {
        for (const prop in obj) {
            this[prop] = obj[prop];
        }
    }
}

module.exports = new Memory();
