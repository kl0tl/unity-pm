'use strict';

var format = require('util').format;

var infoCommand = require('./info');

module.exports = function (name, options) {
  return infoCommand(name, options)
    .then(function (info) {
      return format('https://www.assetstore.unity3d.com/en/#!/content/%s', info.link.id);
    });
};
