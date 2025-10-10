[![npm version](https://badge.fury.io/js/@qavajs%2Fmemory.svg)](https://badge.fury.io/js/@qavajs%2Fmemory)

## @qavajs/memory

Unified test data storage for the `@qavajs` framework

```
npm install @qavajs/memory
```

## Usage
       
The module resolves the provided value from storage
```typescript
import memory from '@qavajs/memory';

When(/^save variable as '(.+)'$/, async function (key) {
    memory.setValue(key, 42);
});

Then(/^value '(.+)' should be equal to '(.+)'$/, async function (variable1, variable2) {
    const val = memory.getValue(variable1);
    expect(val).to.equal(variable2);
});
```

```gherkin
When save variable as 'variable'
Then value of '$variable' should be equal to '42'
```

## Using constants and computed

The module provides the capability to set constant values and computed (values that are calculated at the moment of call)
```typescript
export default {
    constant: 42,
    now: function() {
        return Date.now()
    }
};
```
## Register constants and computed
Before using memory, it needs to be registered. The best place to do it is `Before` hook

```typescript
import memory from '@qavajs/memory';
import memoryMap from './memoryMap.js';

Before(async function() {
    memory.register(memoryMap);
});
```

## Escape `$`
`$` can be escaped with a double backslash

```Gherkin
When I expect text of 'Currency Label' to equal '\\$42'
```

## Parallel
In case you need to assign a unique value for each Cucumber thread and qavajs shard, you can use a `parallel` function.
It will assign value based on `CUCUMBER_WORKER_ID` and `SHARD` env variables.

```typescript
import { parallel } from '@qavajs/memory/utils';

export default class Memory {
    user = parallel([
        { username: 'user1', password: 'password' },
        { username: 'user2', password: 'password' }
    ]);

    // shard mode 
    shardUser = parallel([
        { username: 'user1', password: 'password' },
        { username: 'user2', password: 'password' },
        { username: 'user3', password: 'password' },
        { username: 'user4', password: 'password' }
    ], { shard: true });
}
```
