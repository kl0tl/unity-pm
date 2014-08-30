'use strict';

module.exports = {
  cache: {
    clean: require('./commands/cache/clean'),
    list: require('./commands/cache/list')
  },
  home: require('./commands/home'),
  info: require('./commands/info'),
  init: require('./commands/init'),
  list: require('./commands/list'),
  lookup: require('./commands/lookup'),
  search: require('./commands/search'),
  version: require('./commands/version')
};
