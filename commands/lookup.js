'use strict';

var infoCommand = require('./info');

module.exports = function lookupCommand(name) {
  return infoCommand(name).then(function (info) {
    return info.url;
  });
};
