const { ESLintUtils } = require('@typescript-eslint/utils');

const createRule = ESLintUtils.RuleCreator(name => `https://github.com/yourname/eslint-plugin-group-sort-decorators/blob/main/docs/rules/group-sort.md`);

module.exports = createRule({
  name: 'group-sort',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Sort decorators by group (import source) and optionally within groups',
      recommended: false,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          groups: {
            type: 'array',
            items: { type: 'string' },
            description: 'Ordered list of import paths to group decorators by',
          },
          alphabeticalWithinGroups: {
            type: 'boolean',
            default: true,
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      reorder: 'Decorators should be sorted by group and order.',
    },
  },
  defaultOptions: [{
    groups: [],
    alphabeticalWithinGroups: true
  }],
  create(context, [{ groups, alphabeticalWithinGroups }]) {
    const importMap = new Map();

    return {
      Program(node) {
        // map decorator names to import sources
        for (const stmt of node.body) {
          if (stmt.type === 'ImportDeclaration') {
            const source = stmt.source.value;
            for (const spec of stmt.specifiers) {
              importMap.set(spec.local.name, source);
            }
          }
        }
      },

      ClassBody(classBody) {
        for (const element of classBody.body) {
          const decorators = element.decorators;
          if (!decorators || decorators.length < 2) continue;

          const original = decorators.map(d => d.expression);

          const grouped = [...original].sort((a, b) => {
            const aSource = importMap.get(a.callee?.name || a.name) || '';
            const bSource = importMap.get(b.callee?.name || b.name) || '';

            const aIndex = groups.indexOf(aSource);
            const bIndex = groups.indexOf(bSource);

            if (aIndex !== bIndex) return aIndex - bIndex;
            if (alphabeticalWithinGroups) {
              return (a.name || a.callee?.name).localeCompare(b.name || b.callee?.name);
            }
            return 0;
          });

          const isSame = original.every((exp, i) => exp === grouped[i]);
          if (!isSame) {
            context.report({
              node: decorators[0],
              messageId: 'reorder',
              fix: fixer => {
                const sourceCode = context.getSourceCode();
                const fixedText = grouped.map(d => sourceCode.getText(d)).join('\n');
                return fixer.replaceTextRange(
                  [decorators[0].range[0], decorators[decorators.length - 1].range[1]],
                  fixedText
                );
              }
            });
          }
        }
      }
    };
  }
});
