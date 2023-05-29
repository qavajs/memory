import { test, expect } from 'vitest';
const memory = require('../index');

test('memory is singleton CJS', async () => {
    require('./memory_singleton.cjs');
    expect(memory.getValue('$singletonVal')).to.equal('singleton cjs');
});
