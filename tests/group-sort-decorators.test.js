const { RuleTester } = require('@typescript-eslint/rule-tester');
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
      import { C } from 'lib-c';
      @A()
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
    // FIRST/LAST group options (destructured require)
    {
      code: `
      const { A } = require('lib-a');
      const { B } = require('lib-b');
      const { C } = require('lib-c');
      @A()
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
        // FIRST/LAST group options (require)
    {
      code: `
      const A = require('lib-a');
      const { B } = require('lib-b');
      const C = require('lib-c');
      @A()
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
            // FIRST/LAST group options (require multiple)
    {
      code: `
      const A = require('lib-a');
      const { B, D } = require('lib-b');
      const C = require('lib-c');
      @A()
      @C()
      @B()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
    // FIRST only (import)
    {
      code: `
      import { B } from 'lib-b';
      import { C } from 'lib-c';
      @B()
      @C()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-b'] } }]
    },
    // LAST only (require)
    {
      code: `
      const { B } = require('lib-b');
      const { C } = require('lib-c');
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { last: ['lib-b'] } }]
    },
    // No decorators (import)
    {
      code: `
      import { A } from 'lib-a';
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
    // No decorators (require)
    {
      code: `
      const { A } = require('lib-a');
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }]
    },
    // Single decorator (import)
    {
      code: `
      import { A } from 'lib-a';
      @A()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'] } }]
    },
    // Single decorator (require)
    {
      code: `
      const { A } = require('lib-a');
      @A()
      class Test {}
      `,
      options: [{ groups: { last: ['lib-a'] } }]
    },
    // Alphabetical within middle group (import)
    {
      code: `
      import { C } from 'lib-c';
      import { D } from 'lib-d';
      @C()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: true }]
    },
    // Alphabetical within middle group (require)
    {
      code: `
      const { C } = require('lib-c');
      const { D } = require('lib-d');
      @C()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: true }]
    },
    // Alphabetical within group disabled (import)
    {
      code: `
      import { D, C } from 'lib-c';
      @D()
      @C()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: false }]
    },
    // Alphabetical within group disabled (require)
    {
      code: `
      const { D, C } = require('lib-c');
      @D()
      @C()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: false }]
    }
  ],
  invalid: [
    // FIRST/LAST group options (import)
    {
      code: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      import { C } from 'lib-c';
      @B()
      @C()
      @A()
      class Test {}
      `,
      output: `
      import { A } from 'lib-a';
      import { B } from 'lib-b';
      import { C } from 'lib-c';
      @A()
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }],
      errors: [{ messageId: 'reorder' }]
    },
    // FIRST/LAST group options (require)
    {
      code: `
      const { A } = require('lib-a');
      const { B } = require('lib-b');
      const { C } = require('lib-c');
      @B()
      @C()
      @A()
      class Test {}
      `,
      output: `
      const { A } = require('lib-a');
      const { B } = require('lib-b');
      const { C } = require('lib-c');
      @A()
      @C()
      @B()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }],
      errors: [{ messageId: 'reorder' }]
    },
        // FIRST/LAST group options (require multiple)
    {
      code: `
      const { A } = require('lib-a');
      const { B, D } = require('lib-b');
      const { C } = require('lib-c');
      @D()
      @B()
      @C()
      @A()
      class Test {}
      `,
      output: `
      const { A } = require('lib-a');
      const { B, D } = require('lib-b');
      const { C } = require('lib-c');
      @A()
      @C()
      @B()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: ['lib-a'], last: ['lib-b'] } }],
      errors: [{ messageId: 'reorder' }]
    },
    // Out of order in middle group (import)
    {
      code: `
      import { D } from 'lib-d';
      import { C } from 'lib-c';
      @D()
      @C()
      class Test {}
      `,
      output: `
      import { D } from 'lib-d';
      import { C } from 'lib-c';
      @C()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: true }],
      errors: [{ messageId: 'reorder' }]
    },
    // Out of order in middle group (require)
    {
      code: `
      const { D } = require('lib-d');
      const { C } = require('lib-c');
      @D()
      @C()
      class Test {}
      `,
      output: `
      const { D } = require('lib-d');
      const { C } = require('lib-c');
      @C()
      @D()
      class Test {}
      `,
      options: [{ groups: { first: [], last: [] }, alphabeticalWithinGroups: true }],
      errors: [{ messageId: 'reorder' }]
    },
  ]
});
