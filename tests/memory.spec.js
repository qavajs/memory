const { expect } = require('chai');
const memory = require('../src/Memory');

test('computed without params returns value', () => {
	memory.computed = function () {
		return 42
	}

	expect(memory.getValue('$computed()')).to.equal(42);
});

test('computed with number param returns value', () => {
	memory.computed = function (val) {
		return val
	}

	expect(memory.getValue('$computed(42)')).to.equal(42);
});

test('computed with string param returns value', () => {
	memory.computed = function (val) {
		return val
	}

	expect(memory.getValue('$computed("test string")')).to.equal("test string");
});

test('computed with memory param returns value', () => {
	memory.computed = function (val1, val2, val3) {
		return val1 + val2 + val3
	}

	memory.anotherComputed = function () {
		return 42
	}

	memory.someVal = 42;

	expect(memory.getValue('$computed(42, $anotherComputed(), $someVal)')).to.equal(126);
});

test('value from registered object', () => {
	memory.register({
		someValue: 12
	});

	expect(memory.getValue('$someValue()')).to.equal(12);
});

test('simple string returns as is', () => {
	expect(memory.getValue('val')).to.equal('val');
});

test('throw error if key is not present in memory', () => {
	expect(() => memory.getValue('$val')).to.throw('val is not found in memory');
});

test('memory is singleton', () => {
	require('./memory_singleton');
	expect(memory.getValue('$singletonVal')).to.equal('singleton');
});


// Query tests

test('query string with one existing variable', () => {
	memory.num = 1;
	const queryString = 'Component > #{$num} of Collection'
	const expected = `Component > #1 of Collection`;
	expect(memory.getValue(queryString)).to.equal(expected);
});

test('query string with two existing variables', () => {
	memory.ind1 = 1;
	memory.ind2 = 15;
	const queryString = 'Component > #{$ind1} of Collection1 > #{$ind2} of Collection2'
	const expected = `Component > #1 of Collection1 > #15 of Collection2`;
	expect(memory.getValue(queryString)).to.equal(expected);
});

test('throws for query string with one existing and one non-existent variables', () => {
	memory.ind1 = 3;
	const queryString = 'Component > #{$ind1} of Collection1 > #{$notExists} of Collection2'
	expect(() => memory.getValue(queryString)).to.throw('notExists is not found in memory');
});