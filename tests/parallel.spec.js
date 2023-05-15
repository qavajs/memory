const { expect } = require('chai');
const { parallel } = require('../utils');

test('return value if environment value is not set', () => {
	expect(parallel([1, 2])).to.equal(1);
});
test('return value based on environment value', () => {
	process.env.CUCUMBER_WORKER_ID = '1';
	expect(parallel([1, 2])).to.equal(2);
});

test('throw an error when there are no value in array', () => {
	process.env.CUCUMBER_WORKER_ID = '5';
	expect(() => parallel([1, 2])).to.throw('Value for thread 5 is undefined!\nMake sure you have provided values for each thread.');
});
