'use strict';

var path = require('path');

var glob = require('glob');
var readJson = require('read-json');
var levenshtein = require('fast-levenshtein');
var api = require('unity-asset-store-api');

var nfcall = require('../lib/nfcall');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();

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
      return Promise.all(infos.map(function (info) {
        return nfcall(levenshtein.getAsync, info.title, name)
          .then(function (diff) {
            return { name: info.title, url: info.url, diff: diff };
          });
      }));
    })
    .then(function (results) {
      return results.sort(function (a, b) {
        return b.diff - a.diff;
      });
    })
    .then(function (results) {
      return results.slice(0, limit);
    })
    .then(function (results) {
      return results.map(function (res) {
        return { name: res.name, url: res.url };
      });
    });
}

function searchFromAssetStore(name, options) {
  return api.get('packages/search.json', { query: name, limit: options && options.limit || 99 });
}
