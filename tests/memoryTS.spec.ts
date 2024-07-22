import {test, expect} from 'vitest';

import memory from '../index';

test('memory is singleton TS', async () => {
    require('./memory_singleton.cjs');
    expect(memory.getValue('$singletonVal')).to.equal('singleton cjs');
});
