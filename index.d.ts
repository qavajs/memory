declare interface Logger {
    log(value: any): void;
}

declare type Memory = {
    /**
     * Get value from memory
     * @param key
     * @example
     * const value = memory.getValue('key');
     */
    getValue(key: any): any;
    /**
     * Set value to memory
     * @param key
     * @param value
     * @example
     * memory.setValue('key', 'value');
     */
    setValue(key: string, value: any): void;
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
     * Set logger
     * @param logger
     */
    setLogger(logger: Logger): void;
}
declare const memory: Memory;
export = memory;