# eslint-plugin-group-sort-decorators

[![npm version](https://badge.fury.io/js/eslint-plugin-group-sort-decorators.svg)](https://www.npmjs.com/package/eslint-plugin-group-sort-decorators)

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
      "groups": ["lib-a", "lib-b", "lib-c"],
      "alphabeticalWithinGroups": true
    }]
  }
}
```

## Rule: `group-sort`

This rule enforces that decorators are grouped and ordered according to the import source, and optionally sorted alphabetically within each group.

### Options

- `groups` (array, **required**): Ordered list of import paths to group decorators by.
- `alphabeticalWithinGroups` (boolean, default: `true`): Whether to sort decorators alphabetically within each group.

### Example

**Given this config:**
```json
"groups": ["lib-a", "lib-b"]
```

**Valid:**
```ts
import { A } from 'lib-a';
import { B } from 'lib-b';

@A()
@B()
class Test {}
```

**Invalid:**
```ts
import { A } from 'lib-a';
import { B } from 'lib-b';

@B()
@A()
class Test {}
```
Will be auto-fixed to:
```ts
@A()
@B()
class Test {}
```

### Supports both `import` and `require` statements.

## Contributing

PRs and issues welcome!

## License

MIT