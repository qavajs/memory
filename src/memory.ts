const QAVA_ESCAPE_DOLLAR = 'QAVA_ESCAPE_DOLLAR';
const KEY_REGEXP = /^\$(.+?)(\((.*)\))?$/;
const PARSE_STRING_REGEXP = /({\$.+?})/g;
const ESCAPE_DOLLAR_REGEXP = /\\\$/g;
const UNESCAPE_DOLLAR_REGEXP = new RegExp(QAVA_ESCAPE_DOLLAR, 'g');
const TRUNCATE_LOG = 1000;

function readonly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.writable = false;
}

function toString(value: any): string {
    let logValue = value;
    try {
        if (typeof value === 'object') {
            logValue = JSON.stringify(value, null, 2);
        }
    } catch (err) {
        logValue = value.toString();
    }
    if (typeof logValue === 'string') {
        return logValue.slice(0, TRUNCATE_LOG);
    }
    return logValue;
}

class Memory {

    [prop: string]: any;
    logger: { log: (value: any) => void } = { log() {} };

    /**
     * Get value from memory
     * @param {string} str - string to resolve
     * @returns {any} - resolved value
     * @example const value = memory.getValue('$val');
     */
    @readonly
    getValue(str: any): any {
        let value;
        if (typeof str !== 'string') return str;
        value = str.replace(ESCAPE_DOLLAR_REGEXP, QAVA_ESCAPE_DOLLAR);
        if (KEY_REGEXP.test(value)) value = this.getKey(value);
        else if (PARSE_STRING_REGEXP.test(value)) value = this.getString(value);
        if (typeof value === 'string') value = value.replace(UNESCAPE_DOLLAR_REGEXP, '$');
        const stringValue = toString(value);
        if (stringValue !== str) {
            this.logger.log(`${str} -> ${toString(value)}`);
        }
        return value;
    }

    /**
     * Resolve string with interpolation
     * @private
     * @param {string} str - string to resolve
     * @returns {string} - resolved string
     */
    @readonly
    getString(str: string): any {
        const matches = str.match(PARSE_STRING_REGEXP)
        if (!matches) return str;
        const variables = matches.map((match: string) => match.replace(/[{}]/g, ``));
        return variables
            .reduce((str: string, variable: any) => str.replace(`{${variable}}`, this.getKey(variable)), str)
            .replace(UNESCAPE_DOLLAR_REGEXP, '$');
    }

    /**
     * Set value in memory
     * @param {string} key - key to store
     * @param {any} value - value to store
     * @example memory.setValue('value', 42);
     */
    @readonly
    setValue(key: string, value: any) {
        this[key] = value;
    }

    /**
     * Get key from memory
     * @private
     * @param {string} str - key to resolve
     * @returns {any} - resolved value
     */
    @readonly
    getKey(str: string): any {
        const getFunction = new Function(
            `return ${str.replace(/\$/g, 'this.')}`
                .replace(UNESCAPE_DOLLAR_REGEXP, '$')
        );
        try {
            return getFunction.apply(this);
        } catch (err: any) {
            this.reportError(err);
        }
    }

    /**
     * Register memory object
     * @param {{ [prop: string]: any }} obj - memory object to register
     */
    @readonly
    register(obj: { [prop: string]: any }) {
        for (const prop in obj) {
            this[prop] = obj[prop];
        }
    }

    /**
     * Evaluate js expression
     * @param {any} expression - expression to evaluate
     * @example $js($val + 1)
     */
    @readonly
    js(expression: any) {
        return expression;
    }

    @readonly
    setLogger(logger: { log: (value: any) => void }) {
        this.logger = logger;
    }

    @readonly
    reportError(err: any) {
        err.message = err.message.replace(/this\./g, '$');
        throw err;
    }

}

export default new Memory();
