'use strict';

var format = require('util').format;

var archy = require('archy');
var RcLoader = require('rcloader');

var nfcall = require('../lib/nfcall');

module.exports = function listCommand() {
  var loader = new RcLoader('.asset-store-packages');

  return nfcall(loader.for, './')
    .then(function (assetStorePackages) {
      var packages = Object.keys(assetStorePackages.packages).map(function (name) {
        var version = assetStorePackages.packages[name];
        return { label: format('%s@%s', name, version) };
      });

      return { label: assetStorePackages.directory, nodes: packages };
    })
    .then(archy);
};
