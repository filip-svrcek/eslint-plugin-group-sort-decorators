function getDecoratorName(decorator) {
  const expr = decorator.expression;
  if (expr.type === 'CallExpression') {
    if (expr.callee.type === 'Identifier') return expr.callee.name;
    if (expr.callee.type === 'MemberExpression' && expr.callee.property.type === 'Identifier') return expr.callee.property.name;
  }
  if (expr.type === 'Identifier') return expr.name;
  return null;
}

function buildImportSourceMap(context) {
  const importSourceMap = new Map();
  const program = context.getSourceCode().ast;
  if (!program || !program.body) return importSourceMap;
  for (const node of program.body) {
    if (node.type === 'ImportDeclaration') {
      for (const spec of node.specifiers) {
        if (spec.type === 'ImportSpecifier' || spec.type === 'ImportDefaultSpecifier') {
          importSourceMap.set(spec.local.name, node.source.value);
        }
      }
    }
  }
  return importSourceMap;
}

function setDecoratorOrder(node, context) {
  const decorators = node.decorators;
  if (!decorators || decorators.length < 2) return;

  const options = context.options && context.options[0] ? context.options[0] : {};
  const groups = options.groups || [];
  const alphabeticalWithinGroups = options.alphabeticalWithinGroups !== false;

  const importSourceMap = buildImportSourceMap(context);

  function getSource(decorator) {
    const name = getDecoratorName(decorator);
    return importSourceMap.get(name) || '';
  }

  const sortedDecorators = [...decorators].sort((a, b) => {
    const aSource = getSource(a);
    const bSource = getSource(b);
    const aGroupIdx = groups.indexOf(aSource);
    const bGroupIdx = groups.indexOf(bSource);

    if (aGroupIdx !== bGroupIdx) return aGroupIdx - bGroupIdx;
    if (alphabeticalWithinGroups) {
      const aName = getDecoratorName(a) || '';
      const bName = getDecoratorName(b) || '';
      return aName.localeCompare(bName);
    }
    return 0;
  });

  const decoratorNames = decorators.map(getDecoratorName);
  const sortedNames = sortedDecorators.map(getDecoratorName);

  if (JSON.stringify(decoratorNames) !== JSON.stringify(sortedNames)) {
    context.report({
      node,
      messageId: 'reorder',
      fix(fixer) {
        const sourceCode = context.getSourceCode();
        const first = decorators[0];
        const last = decorators[decorators.length - 1];
        // Use the original text between first and last decorator for line breaks/comments
        const originalText = sourceCode.text.slice(first.range[0], last.range[1]);
        // Split original text into lines
        const lines = originalText.split('\n');
        // Replace decorator lines with sorted decorators, preserving line breaks
        const sortedTexts = sortedDecorators.map((d) => sourceCode.getText(d));
        // If the number of lines matches, preserve line structure
        let fixedText;
        if (lines.length === sortedTexts.length) {
          fixedText = sortedTexts.map((txt, i) => {
            // preserve leading whitespace
            const match = lines[i].match(/^(\s*)/);
            return (match ? match[1] : '') + txt;
          }).join('\n');
        } else {
          // fallback: join with \n
          fixedText = sortedTexts.join('\n');
        }
        return fixer.replaceTextRange([first.range[0], last.range[1]], fixedText);
      },
    });
  }
}

module.exports = {
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
    }
  },

  create(context) {
    function withContext(node) {
      setDecoratorOrder(node, context);
    }
    return {
      MethodDefinition: withContext,
      PropertyDefinition: withContext,
      ClassDeclaration: withContext,
    };
  },
};
