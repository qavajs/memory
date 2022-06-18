## @yaatp/memory

This library provides the capability to transit variables between step and access them from gherkin definitions

`npm install @yaatp/memory`
## Usage
       
Lib resolves provided value from storage
```javascript
const memory = require('@yaatp/memory');

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
    computed: function() {
        return Date.now()
    }
};

```
## Register constants and computed
Before using memory it needs to be registered. The best place to do it is Before hook

```javascript
const memory = require('@yaatp/memory');
const memoryMap = require('./memoryMap.js')
Before(async function() {
    memory.register(memoryMap);
});
```
