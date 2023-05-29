const QAVA_ESCAPE_DOLLAR = 'QAVA_ESCAPE_DOLLAR';
const KEY_REGEXP = /^\$(.+?)(\((.*)\))?$/;
const PARSE_STRING_REGEXP = /({\$.+?})/g;
const ESCAPE_DOLLAR_REGEXP = /\\\$/g;
const UNESCAPE_DOLLAR_REGEXP = new RegExp(QAVA_ESCAPE_DOLLAR, 'g');

function readonly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.writable = false;
}
class Memory {

    [prop: string]: any;

    /**
     * Get value from memory
     * @param {string} str - string to resolve
     * @returns {any} - resolved value
     * @example const value = memory.getValue('$val');
     */
    @readonly
    getValue(str: string) {
        const escapedString = str.replace(ESCAPE_DOLLAR_REGEXP, QAVA_ESCAPE_DOLLAR);
        if (KEY_REGEXP.test(escapedString)) return this.getKey(escapedString);
        if (PARSE_STRING_REGEXP.test(escapedString)) return this.getString(escapedString);
        return escapedString.replace(UNESCAPE_DOLLAR_REGEXP, '$');
    }

    /**
     * Resolve string with interpolation
     * @private
     * @param {string} str - string to resolve
     * @returns {string} - resolved string
     */
    @readonly
    getString(str: string) {
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
    getKey(str: string) {
        const getFunction = new Function(
            `return ${str.replace(/\$/g, 'this.')}`
                .replace(UNESCAPE_DOLLAR_REGEXP, '$')
        );
        return getFunction.apply(this);
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

}

export default new Memory();
