module.exports = {
  rules: {
    'group-sort': require('./lib/rules/group-sort-decorators'),
  },
  configs: {
    recommended: {
      plugins: ['group-sort-decorators'],
      rules: {
        'group-sort-decorators/group-sort': 'warn',
      },
    },
  }
};
