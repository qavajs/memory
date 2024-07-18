import {test, expect, beforeEach} from 'vitest';
import memory from '../src/memory';

beforeEach(() => {
    memory.register({});
});

test('number', () => {
    expect(memory.getValue('$js(1)')).to.equal(1);
});

test('string double quotes', () => {
    expect(memory.getValue('$js("dq_str")')).to.equal('dq_str');
});

test('string single quotes', () => {
    expect(memory.getValue("$js('sq_str')")).to.equal('sq_str');
});

test('boolean', () => {
    expect(memory.getValue('$js(true)')).to.equal(true);
});

test('array', () => {
    expect(memory.getValue('$js([1, 2, 3, 4])')).to.deep.equal([1, 2, 3, 4]);
});

test('object', () => {
    expect(memory.getValue('$js({answer: 42})')).to.deep.equal({answer: 42});
});

test('function', () => {
    expect(memory.getValue('$js(x => x ** 2)')(12)).to.deep.equal(144);
});

