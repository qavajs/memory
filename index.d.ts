declare interface Logger {
    log(value: any): void;
}

declare type Memory = {
    register(memoryMap: Object): void;
    setValue(key: string, value: any): void;
    getValue(key: any): any;
    setLogger(logger: Logger): void;
}
declare const memory: Memory;
declare module '@qavajs/memory' {
    export default memory
}
