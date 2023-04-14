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
	expect(() => memory.getValue('$val')).to.throw('$val\n\'val\' is not defined');
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
	expect(() => memory.getValue(queryString)).to.throw('$notExists\n\'notExists\' is not defined');
});

test('property from object in dot notation', () => {
	memory.register({
		someValue: {
			prop: 42
		}
	});

	expect(memory.getValue('$someValue.prop')).to.equal(42);
});

test('property from object in bracket notation', () => {
	memory.register({
		someValue: {
			prop: 42
		}
	});

	expect(memory.getValue('$someValue[\'prop\']')).to.equal(42);
	expect(memory.getValue('$someValue["prop"]')).to.equal(42);
});

test('element from array', () => {
	memory.register({
		someValue: [1,2,3]
	});

	expect(memory.getValue('$someValue[2]')).to.equal(3);
});

test('property is function (number argument)', () => {
	memory.register({
		someValue: {
			fn: function (val) { return val }
		}
	});

	expect(memory.getValue('$someValue.fn(42)')).to.equal(42);
});

test('property is function (string argument)', () => {
	memory.register({
		someValue: {
			fn: function (val) { return val }
		}
	});

	expect(memory.getValue('$someValue.fn("42")')).to.equal('42');
});

test('property two level', () => {
	memory.register({
		someValue: {
			arr: [
				{ prop: 42 }
			]
		}
	});

	expect(memory.getValue('$someValue.arr[0].prop')).to.equal(42);
});

test('property from added object', () => {
	const obj = { prop: 42 };
	memory.setValue('obj', obj);

	expect(memory.getValue('$obj.prop')).to.equal(42);
});

test('comma in string param', () => {
	const computed = (param) => param;
	memory.setValue('computed', computed);
	expect(memory.getValue(`$computed("1,2")`)).to.equal('1,2');
	expect(memory.getValue(`$computed('1,2')`)).to.equal('1,2');
});

test('single quote in double quote', () => {
	const computed = (param) => param;
	memory.setValue('computed', computed);
	expect(memory.getValue(`$computed("'test'")`)).to.eql(`'test'`);
});

test('double quote in single quote', () => {
	const computed = (param) => param;
	memory.setValue('computed', computed);
	expect(memory.getValue(`$computed('"test"')`)).to.eql(`"test"`);
});

test('floating param', () => {
	const computed = (param) => param;
	memory.setValue('computed', computed);
	expect(memory.getValue(`$computed(36.6)`)).to.eql(36.6);
});

test('store function', () => {
	const computed = (param) => param;
	memory.setValue('computed', computed);
	const fn = memory.getValue(`$computed`);
	expect(fn).to.be.a('function');
	expect(fn(42)).to.equal(42)
});

test('escape $ as simple value', () => {
	expect(memory.getValue('\\$val')).to.equal('$val');
});

test('escape $ as computed', () => {
	expect(memory.getValue('\\$computed()')).to.equal('$computed()');
});

test('save context for methods', () => {
	memory.setValue('obj', {
		prop: 42,
		getProp() {
			return this.prop
		}
	})
	expect(memory.getValue('$obj.getProp()')).to.equal(42);
});

test('chaining method calls', () => {
	memory.setValue('obj', {
		method1() {
			return {
				method2() {
					return 'Im method'
				},
				prop: 42
			}
		}
	})
	expect(memory.getValue('$obj.method1().method2()')).to.equal('Im method');
	expect(memory.getValue('$obj.method1().prop')).to.equal(42);
});

test('inner computed call', () => {
	memory.setValue('comp1', function (val) { return val });
	expect(memory.getValue('$comp1($comp1(42))')).to.equal(42);
});

test('inner method call', () => {
	memory.setValue('obj1', {
		method1(val) {
			return val
		}
	})
	memory.setValue('obj2', {
		method1(val) {
			return val
		}
	})
	expect(memory.getValue('$obj1.method1($obj2.method1(42))')).to.equal(42);
});

