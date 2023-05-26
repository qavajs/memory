import { test, expect } from 'vitest';
import memory from '../src/Memory';

test('memory is singleton ESM', async () => {
    await import('./memory_singleton.mjs');
    expect(memory.getValue('$singletonVal')).to.equal('singleton mjs');
});
