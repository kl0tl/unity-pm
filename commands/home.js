'use strict';

var opn = require('opn');
var nfcall = require('../lib/nfcall');
var lookupCommand = require('./lookup');

module.exports = function homeCommand(name) {
  return lookupCommand(name).then(function (url) {
    return nfcall(opn, url);
  });
};
