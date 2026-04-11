[![npm version](https://badge.fury.io/js/@qavajs%2Fmemory.svg)](https://badge.fury.io/js/@qavajs%2Fmemory)

## @qavajs/memory

Unified test data storage for the `@qavajs` framework. Provides a singleton memory store with support for constants, computed values, string interpolation, and parallel test data assignment.

```
npm install @qavajs/memory
```

---

## Usage

Import the singleton and use `getValue`/`setValue` in your step definitions:

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

`getValue` passes non-string values through unchanged, so it is safe to call on any step parameter.

---

## Register constants and computed values

Define a memory map with constants and computed functions, then register it before your tests run:

```typescript
// memoryMap.ts
export default {
  constant: 42,
  baseUrl: 'https://example.com',
  now: function () {
    return Date.now();
  },
  uuid: function () {
    return crypto.randomUUID();
  },
};
```

```typescript
// hooks.ts
import memory from '@qavajs/memory';
import memoryMap from './memoryMap.js';

Before(async function () {
  memory.register(memoryMap);
});
```

Plain properties are constants; `function` properties are **computed** — they are evaluated each time `getValue` resolves them.

---

## Value resolution syntax

### Simple key lookup

Prefix a key with `$` to look it up in memory:

```gherkin
Then value of '$variable' should equal '42'
```

### Property access

Dot notation and bracket notation both work:

```gherkin
Then value of '$user.name' should equal 'Alice'
Then value of '$items[0]' should equal 'first'
```

### Calling computed functions with arguments

```gherkin
Then value of '$add(1, 2)' should equal '3'
```

### String interpolation

Wrap `$key` references in `{...}` to embed memory values inside a larger string:

```gherkin
Then endpoint '{$baseUrl}/api/users/{$userId}' should return 200
```

### Built-in `$js()` computed

Evaluate arbitrary JavaScript expressions against the current memory storage:

```gherkin
Then value of '$js($counter + 1)' should equal '6'
Then value of '$js(JSON.stringify($user))' should be valid JSON
```

---

## Escaping `$`

Prefix `$` with a double backslash to treat it as a literal character:

```gherkin
When I expect text of 'Currency Label' to equal '\\$42'
```

---

## API

### `memory.getValue(str)`

Resolves a value from memory. Returns the input unchanged if it is not a string or contains no `$` references.

| Parameter | Type  | Description                                |
|-----------|-------|--------------------------------------------|
| `str`     | `any` | String to resolve, or a pass-through value |

Returns `any`.

---

### `memory.setValue(key, value)`

Stores a value in memory under `key`.

| Parameter | Type     | Description    |
|-----------|----------|----------------|
| `key`     | `string` | Storage key    |
| `value`   | `any`    | Value to store |

---

### `memory.register(memoryMap)`

Registers a memory map object as the backing storage. Call this once before your tests run. All keys from the map become resolvable via `$key` syntax.

| Parameter   | Type     | Description                   |
|-------------|----------|-------------------------------|
| `memoryMap` | `object` | Object of constants/computeds |

---

### `memory.setLogger(logger)`

Attach a logger to trace value resolution. The logger receives a formatted string for each `getValue` call that transforms the input.

```typescript
import memory from '@qavajs/memory';

memory.setLogger({ log: (msg) => console.log('[memory]', msg) });
// Output: [memory] $username -> alice
//         [memory] $counter <- 5
```

| Parameter | Type                            | Description     |
|-----------|---------------------------------|-----------------|
| `logger`  | `{ log: (value: any) => void }` | Logger instance |

---

### `memory.convertToString(value)`

Converts a value to a string for logging. Override this method to customize serialization (e.g. use `util.inspect` instead of `JSON.stringify`):

```typescript
import util from 'util';
import memory from '@qavajs/memory';

memory.convertToString = function (value) {
  return util.inspect(value);
};
```

---

## Parallel test data

When running Cucumber in parallel mode or using qavajs shards, use `parallel` to assign unique data per thread:

```typescript
import { parallel } from '@qavajs/memory/utils';

export default class Memory {
  // Assigns by CUCUMBER_WORKER_ID (0-based)
  user = parallel([
    { username: 'user1', password: 'password' },
    { username: 'user2', password: 'password' },
  ]);

  // Assigns by worker + shard offset (requires SHARD env var)
  shardUser = parallel(
    [
      { username: 'user1', password: 'password' },
      { username: 'user2', password: 'password' },
      { username: 'user3', password: 'password' },
      { username: 'user4', password: 'password' },
    ],
    { shard: true }
  );
}
```

`parallel` reads `CUCUMBER_WORKER_ID` (default `0`) and `CUCUMBER_TOTAL_WORKERS` from the environment. In shard mode it also reads `SHARD` (1-based) and multiplies across workers to produce a globally unique index.

---

## License

MIT
