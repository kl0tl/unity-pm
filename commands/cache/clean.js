'use strict';

var path = require('path');

var del = require('del');
var nfcall = require('../../lib/nfcall');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();
var assetStorePackagesPattern = path.join(assetStoreDirectoryPath, '**', '*');

module.exports = function cacheCleanCommand() {
  return nfcall(del, [assetStorePackagesPattern], { force: true});
};
