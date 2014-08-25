'use strict';

var path = require('path');
var exec = require('child_process').execFile;

var glob = require('glob');
var readJson = require('read-json');
var levenshtein = require('fast-levenshtein');
var request = require('request');
var queryString = require('query-string');
var nfcall = require('../lib/nfcall');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();
var assetStoreSearchUrl = 'https://www.assetstore.unity3d.com/api/en-US/search/xplr/search.json';
var assetStoreContentUrl = 'https://www.assetstore.unity3d.com/en/#!/content/';

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
  var params = queryString.stringify({
    query: name, limit: options && options.limit || 99
  });

  return new Promise(function (resolve, reject) {
      request({
        url: assetStoreSearchUrl + '?' + params,
        headers: {
          'X-Unity-Session': '26c4202eb475d02864b40827dfff11a14657aa41'
        }
      }, function (err, res, body) {
        if (err) reject(err);
        else resolve(body);
      });
    })
    .then(JSON.parse)
    .then(function (res) {
      return res.results.map(function (info) {
        return { name: info.title, url: assetStoreContentUrl + info.link.id };
      });
    });
}
