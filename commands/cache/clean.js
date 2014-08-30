'use strict';

var path = require('path');

var rimraf = require('rimraf');

var nfcall = require('../../lib/nfcall');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();
var assetStorePackagesPattern = path.join(assetStoreDirectoryPath, '**', '*');

module.exports = function () {
  return nfcall(rimraf, assetStorePackagesPattern);
};
