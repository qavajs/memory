# Change Log

All notable changes to the "@qavajs/memory" will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.10.2]
- :beetle: fixed issue with calling functions in templates

## [1.10.1]
- :beetle: fixed issue with parsing json

## [1.10.0]
- :rocket: added export of Memory type
- :beetle: fixed issue with nested curly braces

## [1.9.0]
- :rocket: added logging on _setValue_

## [1.8.0]
- :rocket: added support of top-level getters
Breaking Change: all memory values are now stored in _storage_ property

## [1.7.1]
- :rocket: improved error handling to produce more clear errors

## [1.7.0]
- :rocket: updated parallel function to support qavajs shards

## [1.6.2]
- :beetle: disabled logging of non-memory values

## [1.6.1]
- :beetle: fixed issue with unexpected object conversion

## [1.6.0]
- :rocket: added capability to provide logger

## [1.5.1]
- :beetle: fixed issue with non string inputs

## [1.5.0]
Breaking Change:
Memory no more throwing error if value does not exist. Instead, _undefined_ is returned.
- :rocket: refactored and simplified whole library
- :rocket: added _$js_ computed to evaluate expression
```javascript
const result = memory.getValue('$js($val + 1)'); // evaluates js expression
```
- :rocket: all JS types are now supported in computed

## [1.4.2]
- :beetle: fixed issue with dots in computed params

## [1.4.1]
- :beetle: fixed issue with square brackets in computed params

## [1.4.0]
- :rocket: added _parallel_ util function

## [1.3.0]
- :rocket: implemented chaining of computed results
- :beetle: fixed empty string as computed param

## [1.2.1]
- :beetle: fixed context for methods calling

## [1.2.0]
- :rocket: implemented capability to escape $

## [1.1.1]
- :beetle: fixed issue that prevent storing functions in memory
- :beetle: fixed issue with quotes and double quotes
