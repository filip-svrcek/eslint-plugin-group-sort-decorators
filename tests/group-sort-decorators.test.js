const { RuleTester } = require( '@typescript-eslint/rule-tester');
const rule = require('../lib/rules/group-sort-decorators');
const parser = require('@typescript-eslint/parser');

const ruleTester = new RuleTester({
  languageOptions: {
    parser,
  },
});

ruleTester.run('group-sort', rule, {
  valid: [
    {
      code: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      @A()
      @B()
      class Test {}
      `,
      options: [{ groups: ['lib-a', 'lib-b'] }]
    },
    // Single decorator, should be valid
    {
      code: `
      import { A } from 'lib-a';
      @A()
      class Test {}
      `,
      options: [{ groups: ['lib-a', 'lib-b'] }]
    },
    // No decorators, should be valid
    {
      code: `
      class Test {}
      `,
      options: [{ groups: ['lib-a', 'lib-b'] }]
    },
    // Decorators from same group, alphabeticalWithinGroups true (default)
    {
      code: `
      import { B, A } from 'lib-a';
      @A()
      @B()
      class Test {}
      `,
      options: [{ groups: ['lib-a'] }]
    },
    // Decorators from same group, alphabeticalWithinGroups false
    {
      code: `
      import { B, A } from 'lib-a';
      @B()
      @A()
      class Test {}
      `,
      options: [{ groups: ['lib-a'], alphabeticalWithinGroups: false }]
    }
  ],
  invalid: [
    {
      code: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      @B()
      @A()
      class Test {}
      `,
      output: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      @A()
      @B()
      class Test {}
      `,
      options: [{ groups: ['lib-a', 'lib-b'] }],
      errors: [{ messageId: 'reorder' }]
    },
    // Out of order with three decorators, mixed groups
    {
      code: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      import { C } from 'lib-c';
      @C()
      @B()
      @A()
      class Test {}
      `,
      output: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      import { C } from 'lib-c';
      @A()
      @B()
      @C()
      class Test {}
      `,
      options: [{ groups: ['lib-a', 'lib-b', 'lib-c'] }],
      errors: [{ messageId: 'reorder' }]
    },
    // Out of order within group, alphabeticalWithinGroups true
    {
      code: `
      import { B, A } from 'lib-a';
      @B()
      @A()
      class Test {}
      `,
      output: `
      import { B, A } from 'lib-a';
      @A()
      @B()
      class Test {}
      `,
      options: [{ groups: ['lib-a'], alphabeticalWithinGroups: true }],
      errors: [{ messageId: 'reorder' }]
    }
  ]
});
