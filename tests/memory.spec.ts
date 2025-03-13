import {beforeEach, test, expect} from 'vitest';
import memory from '../src/memory';

beforeEach(() => {
    memory.register({});
});

test('computed without params returns value', () => {
    memory.storage.computed = function () {
        return 42
    }

    expect(memory.getValue('$computed()')).to.equal(42);
});

test('computed with number param returns value', () => {
    memory.storage.computed = function (val: any) {
        return val
    }

    expect(memory.getValue('$computed(42)')).to.equal(42);
});

test('computed with string param returns value', () => {
    memory.storage.computed = function (val: any) {
        return val
    }

    expect(memory.getValue('$computed("test string")')).to.equal("test string");
});

test('computed with memory param returns value', () => {
    memory.storage.computed = function (val1: any, val2: any, val3: any) {
        return val1 + val2 + val3
    }

    memory.storage.anotherComputed = function () {
        return 42
    }

    memory.storage.someVal = 42;

    expect(memory.getValue('$computed(42, $anotherComputed(), $someVal)')).to.equal(126);
});

test('value from registered object', () => {
    memory.register({
        someValue: 12
    });

    expect(memory.getValue('$someValue')).to.equal(12);
});

test('simple string returns as is', () => {
    expect(memory.getValue('val')).to.equal('val');
});

// Query tests

test('query string with one existing variable', () => {
    memory.storage.num = 1;
    const queryString = 'Component > #{$num} of Collection'
    const expected = `Component > #1 of Collection`;
    expect(memory.getValue(queryString)).to.equal(expected);
});

test('query string with two existing variables', () => {
    memory.storage.ind1 = 1;
    memory.storage.ind2 = 15;
    const queryString = 'Component > #{$ind1} of Collection1 > #{$ind2} of Collection2'
    const expected = `Component > #1 of Collection1 > #15 of Collection2`;
    expect(memory.getValue(queryString)).to.equal(expected);
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
        someValue: [1, 2, 3]
    });

    expect(memory.getValue('$someValue[2]')).to.equal(3);
});

test('property is function (number argument)', () => {
    memory.register({
        someValue: {
            fn: function (val: any) {
                return val
            }
        }
    });

    expect(memory.getValue('$someValue.fn(42)')).to.equal(42);
});

test('property is function (string argument)', () => {
    memory.register({
        someValue: {
            fn: function (val: any) {
                return val
            }
        }
    });

    expect(memory.getValue('$someValue.fn("42")')).to.equal('42');
});

test('property two level', () => {
    memory.register({
        someValue: {
            arr: [
                {prop: 42}
            ]
        }
    });

    expect(memory.getValue('$someValue.arr[0].prop')).to.equal(42);
});

test('property from added object', () => {
    const obj = {prop: 42};
    memory.setValue('obj', obj);

    expect(memory.getValue('$obj.prop')).to.equal(42);
});

test('comma in string param', () => {
    const computed = (param: any) => param;
    memory.setValue('computed', computed);
    expect(memory.getValue(`$computed("1,2")`)).to.equal('1,2');
    expect(memory.getValue(`$computed('1,2')`)).to.equal('1,2');
});

test('floating param', () => {
    const computed = (param: any) => param;
    memory.setValue('computed', computed);
    expect(memory.getValue(`$computed(36.6)`)).to.eql(36.6);
});

test('store function', () => {
    const computed = (param: any) => param;
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
    memory.setValue('comp1', function (val: any) {
        return val
    });
    expect(memory.getValue('$comp1($comp1(42))')).to.equal(42);
});

test('inner method call', () => {
    memory.setValue('obj1', {
        method1(val: any) {
            return val
        }
    })
    memory.setValue('obj2', {
        method1(val: any) {
            return val
        }
    })
    expect(memory.getValue('$obj1.method1($obj2.method1(42))')).to.equal(42);
});

test('empty string as computed param', () => {
    memory.setValue('fn', function (val: any) {
        return val
    })
    expect(memory.getValue('$fn("")')).to.equal('');
    expect(memory.getValue("$fn('')")).to.equal('');
});

test('param is property array element', () => {
    memory.setValue('obj1', {
        method1(val: any) {
            return val
        }
    })
    memory.setValue('obj2', {
        arr: [1, 42]
    })
    expect(memory.getValue('$obj1.method1($obj2.arr[1])')).to.equal(42);
});

test('param is space containing property', () => {
    memory.setValue('obj1', {
        method1(val: any) {
            return val
        }
    })
    memory.setValue('obj2', {
        obj: {
            "contain space": 42
        }
    })
    expect(memory.getValue('$obj1.method1($obj2.obj["contain space"])')).to.equal(42);
});

test('dot in computed fn string param', () => {
    memory.setValue('fn', function (...params: any) {
        return params
    });
    memory.setValue('val', 10);
    expect(memory.getValue('$fn($val, "some.value")')).to.deep.equal([10, 'some.value']);
});

test('dot in computed method string param', () => {
    memory.setValue('obj', {
        method(...params: any[]) {
            return params
        }
    });
    memory.setValue('fn', function (...params: any) {
        return params
    });
    memory.setValue('val', 10);
    expect(memory.getValue('$obj.method($val, $fn("another.value"), "some.value")')).to.deep.equal([10, ['another.value'], 'some.value']);
});

test('$ in computed param string', () => {
    memory.setValue('fn', (val: any) => val);
    expect(memory.getValue('$fn("\\$56")')).to.equal('$56');
});

test('evaluate expression', () => {
    memory.setValue('val', 41);
    expect(memory.getValue('$js($val + 1)')).to.equal(42);
});

test('expression with JS global objects', () => {
    memory.setValue('val', 144);
    expect(memory.getValue('$js(Math.sqrt($val))')).to.equal(12);
});

test('use value from closure', () => {
    const val = 42;
    memory.setValue('fn', function () {
        return val
    });
    expect(memory.getValue('$fn()')).to.equal(42);
});

test('interpolation without memory values', () => {
    expect(memory.getValue('some {string}')).to.equal('some {string}');
});

test('non string input', () => {
    expect(memory.getValue(42)).to.equal(42);
});

test('empty object conversion', () => {
    memory.setValue('key', {});
    expect(memory.getValue('$key')).to.deep.equal({});
});

test('correct error message', () => {
    expect(() => memory.getValue('$x()')).toThrow('$x is not a function');
});

test('correct error message in template string', () => {
    expect(() => memory.getValue('{$x()}')).toThrow('$x is not a function');
});

test('getter', () => {
    let closure = 1;
    memory.register({
        get x() { return closure++ }
    });
    expect(memory.getValue('$x')).to.equal(1);
    expect(memory.getValue('$x')).to.equal(2);
});

test('escape curly braces', () => {
    memory.setValue('fn', (text: string) => 'inner value');
    expect(memory.getValue('template {$fn("{inner value}")}')).to.equal('template inner value');
});

test('resolve json', () => {
    memory.setValue('randomName', (text: string) => 'random');
    const json = `{"email": "{$randomName(6)}+{$randomName(6)}"}`
    expect(memory.getValue(json)).to.equal('{"email": "random+random"}');
});

test('resolve template with function', () => {
    memory.setValue('x', (text: string) => text);
    memory.setValue('y', 42);
    const expression = 'text {$x($y)}';
    expect(memory.getValue(expression)).to.equal('text 42');
});

test('$js has access to memory context', () => {
    memory.setValue('value', 42);
    expect(memory.getValue('$js(this.value)')).to.equal(42);
});






