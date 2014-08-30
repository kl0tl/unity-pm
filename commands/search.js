'use strict';

var format = require('util').format;
var path = require('path');

var api = require('unity-asset-store-api');
var glob = require('glob');
var levenshtein = require('fast-levenshtein');
var Promise = require('native-promise-only');
var readJson = require('read-json');

var nfcall = require('../lib/nfcall');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();
var assetStorePackageUrl = 'https://www.assetstore.unity3d.com/en/#!/content/%s';

module.exports = function searchCommand(name, options) {
  var offline = options && options.offline || false;
  var method = offline ? searchFromCache : searchFromAssetStore;

  return method(name, options);
};

function searchFromCache(name, options) {
  var limit = options && options.limit || 99;

  return nfcall(glob, path.join(assetStoreDirectoryPath, '*', '*', '*.json'))
    .then(function (files) {
      return Promise.all(files.map(function (file) {
        return nfcall(readJson, file);
      }));
    })
    .then(function (infos) {
      return infos.map(function (info) {
          return { name: info.title, url: format(assetStorePackageUrl, info.link.id),
            diff: levenshtein.get(info.title, name) };
        })
        .sort(function (a, b) {
          return b.diff - a.diff;
        })
        .slice(0, limit)
        .map(function (res) {
          return { name: res.name, url: res.url };
        })
    });
}

function searchFromAssetStore(name, options) {
  return api.get('packages/search.json', { query: name, limit: options && options.limit || 99 })
    .then(function (results) {
      return results.results.map(function (res) {
        return { name: res.title, url: format(assetStorePackageUrl, res.link.id) };
      });
    });
}
