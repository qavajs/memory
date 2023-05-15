[![npm version](https://badge.fury.io/js/@qavajs%2Fmemory.svg)](https://badge.fury.io/js/@qavajs%2Fmemory)

## @qavajs/memory

This library provides the capability to transit variables between step and access them from gherkin definitions

`npm install @qavajs/memory`
## Usage
       
Lib resolves provided value from storage
```javascript
const memory = require('@qavajs/memory');

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

Lib provides capability to set constant values and computed (values that calculated in the moment of call)
```javascript
module.exports = {
    CONSTANT: 42,
    now: function() {
        return Date.now()
    }
};
```
## Register constants and computed
Before using memory it needs to be registered. The best place to do it is Before hook

```javascript
const memory = require('@qavajs/memory');
const memoryMap = require('./memoryMap.js')
Before(async function() {
    memory.register(memoryMap);
});
```

## Escape $
_$_ can be escaped with double backslash

```Gherkin
When I expect text of 'Currency Label' to equal '\\$42'
```

## Parallel
In case you need to assign uniq value for each Cucumber thread you can use parallel function.
It will assign value based on CUCUMBER_WORKER_ID env variable. 

```javascript
const { parallel } = require('@qavajs/memory/utils');

class Memory {
    user = parallel([
        { username: 'user1', password: 'password' },
        { username: 'user2', password: 'password' }
    ]);
}

module.exports = Memory;
```
