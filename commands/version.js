'use strict';

var RcLoader = require('rcloader');

var infoCommand = require('./info');
var nfcall = require('../lib/nfcall');

module.exports = function (name, options) {
  var g = options && options.global || false;
  var method = g ? getGlobalPackageVersion : getLocalPackageVersion;

  return method(name);
};

function getGlobalPackageVersion(name) {
  return infoCommand(name, { offline: true })
    .then(function (res) { return res.version; });
}

function getLocalPackageVersion(name) {
  var loader = new RcLoader('.asset-store-packages');

  return nfcall(loader.for, './')
    .then(function (dotfile) {
      if (!(name in dotfile.packages)) {
        throw new Error();
      }

      return dotfile.packages[name];
    });
}
