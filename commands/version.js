'use strict';

var RcLoader = require('rcloader');

var infoCommand = require('./info');
var nfcall = require('../lib/nfcall');

module.exports = function versionCommand(name, options) {
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
    .then(function (assetStorePackages) {
      if (!(name in assetStorePackages.packages)) {
        throw new Error();
      }

      return assetStorePackages.packages[name];
    });
}
