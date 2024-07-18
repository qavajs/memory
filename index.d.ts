declare interface Logger {
    log(value: any): void;
}

declare type Memory = {
    /**
     * Register memory map
     * @param memoryMap
     * @example
     * memory.register({
     *     key1: 'value1',
     *     key2: 42
     *     key3: {
     *         property: 12
     *     }
     * })
     */
    register(memoryMap: Object): void;
    /**
     * Set value to memory
     * @param key
     * @param value
     * @example
     * memory.setValue('key', 'value');
     */
    setValue(key: string, value: any): void;
    /**
     * Get value from memory
     * @param key
     * @example
     * const value = memory.getValue('key');
     */
    getValue(key: any): any;
    /**
     * Set logger
     * @param logger
     */
    setLogger(logger: Logger): void;
}
declare const memory: Memory;
declare module '@qavajs/memory' {
    export default memory
}
export default memory;