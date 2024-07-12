import {beforeEach, expect, test} from 'vitest';
import memory from '../src/memory';

const logger: { logs: string[], log: (value: string) => void } = {
    logs: [],
    log(value: string) {
        this.logs.push(value);
    }
};

beforeEach(() => {
    logger.logs = [];
    memory.setLogger(logger);
});
test('log string', () => {
    memory.setValue('key', 'value');
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> value`);
});

test('log number', () => {
    memory.setValue('key', 2);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> 2`);
});

test('log boolean', () => {
    memory.setValue('key', false);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> false`);
});

test('log object', () => {
    memory.setValue('key', {key: 42});
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> {\n  "key": 42\n}`);
});

test('log array', () => {
    memory.setValue('key', [42, 'string']);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> [\n  42,\n  "string"\n]`);
});

test('log function', () => {
    memory.setValue('key', () => {
        console.log(42)
    });
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> () => {\n    console.log(42);\n  }`);
});

test('log circular object', () => {
    const a: {b: any} = {b: null};
    a.b = {a};
    memory.setValue('key', a);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> [object Object]`);
});

test('log null', () => {
    memory.setValue('key', null);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> null`);
});

test('log undefined', () => {
    memory.setValue('key', undefined);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> undefined`);
});

test('log long string', () => {
    const thousand = 'qava'.repeat(250);
    const longer = '12345';
    memory.setValue('key', thousand + longer);
    memory.getValue('$key');
    expect(logger.logs.pop()).to.equal(`$key -> ${thousand}`);
});
