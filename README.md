# eslint-plugin-group-sort-decorators

[![npm version](https://badge.fury.io/js/eslint-plugin-group-sort-decorators.svg)](https://badge.fury.io/js/eslint-plugin-group-sort-decorators.svg)

An ESLint plugin to enforce consistent grouping and ordering of decorators based on their import source, with optional alphabetical sorting within groups.

## Installation

```sh
npm install --save-dev eslint-plugin-group-sort-decorators
```

## Usage

Add `group-sort-decorators` to your ESLint plugins and configure the rule in your ESLint config:

```json
{
  "plugins": ["group-sort-decorators"],
  "rules": {
    "group-sort-decorators/group-sort": ["warn", {
      "groups": {
        "first": ["lib-a"],
        "last": ["lib-b"]
      },
      "alphabeticalWithinGroups": true
    }]
  }
}
```

## Rule: `group-sort`

This rule enforces that decorators are grouped and ordered according to the import source, and optionally sorted alphabetically within each group.

### Options

- `groups.first` (array): List of import sources whose decorators should always come first, in order.
- `groups.last` (array): List of import sources whose decorators should always come last, in order.
- Decorators from sources not listed in `first` or `last` will be placed in the middle, sorted alphabetically by import source.
- `alphabeticalWithinGroups` (boolean, default: `true`): Whether to sort decorators alphabetically within each group.

### Example

**Given this config:**
```json
"groups": {
  "first": ["lib-a"],
  "last": ["lib-b"]
}
```

**Valid:**
```ts
import { A } from 'lib-a';
import { C } from 'lib-c';
import { B } from 'lib-b';

@A()
@C()
@B()
class Test {}
```

**Invalid:**
```ts
import { A } from 'lib-a';
import { C } from 'lib-c';
import { B } from 'lib-b';

@B()
@C()
@A()
class Test {}
```
Will be auto-fixed to:
```ts
@A()
@C()
@B()
class Test {}
```

### Supports both `import` and `require` statements.

## Contributing

PRs and issues welcome!

## License

MIT