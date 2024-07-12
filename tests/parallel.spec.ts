import {test, expect, beforeEach} from 'vitest';
import {parallel} from '../utils';

const entries = [1, 2, 3, 4];

beforeEach(() => {
    delete process.env.CUCUMBER_WORKER_ID;
    delete process.env.SHARD;
    process.env.TOTAL_SHARDS = '2';
    process.env.CUCUMBER_TOTAL_WORKERS = '2';
});
test.each([
    {workerId: undefined, shard: undefined, options: undefined, expected: 1},
    {workerId: '1', shard: undefined, options: undefined, expected: 2},
    {workerId: '0', shard: '1', options: undefined, expected: 1},
    {workerId: '0', shard: '1', options: {shard: true}, expected: 1},
    {workerId: '0', shard: '2', options: {shard: true}, expected: 3},
    {workerId: '1', shard: '2', options: {shard: true}, expected: 4},
    {workerId: undefined, shard: '1', options: {shard: true}, expected: 1},
    {workerId: undefined, shard: '2', options: {shard: true}, expected: 3},
])('parallel(workerId: $workerId, shard: $shard, options: $options) -> $expected',
    ({workerId, shard, options, expected}) => {
        if (workerId) process.env.CUCUMBER_WORKER_ID = workerId;
        if (shard) process.env.SHARD = shard;
        expect(parallel(entries, options)).to.equal(expected);
    })

test('throw an error when there are no value in array', () => {
    process.env.CUCUMBER_WORKER_ID = '5';
    expect(() => parallel([1, 2])).to.throw('Value for thread 5 is undefined!\nMake sure you have provided values for each thread.');
});
