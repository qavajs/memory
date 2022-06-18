declare type Memory = {
    register(memoryMap: Object): void;
    setValue(key: string, value: any): void;
    getValue(key: string): any;
}
declare const memory: Memory;
declare module '@yaatp/memory' {
    export default memory
}
