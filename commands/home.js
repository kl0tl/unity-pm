'use strict';

var opn = require('opn');

var nfcall = require('../lib/nfcall');
var lookupCommand = require('./lookup');

module.exports = function (name, options) {
  return lookupCommand(name, options)
    .then(function (url) { return nfcall(opn, url); });
};
