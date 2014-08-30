'use strict';

require('array.prototype.find');

var format = require('util').format;
var fs = require('fs');
var path = require('path');
var sanitize = require('sanitize-filename');

var glob = require('glob');
var mkdirp = require('mkdirp');
var readJson = require('read-json');

var api = require('unity-asset-store-api');
var nfcall = require('../lib/nfcall');
var searchCommand = require('./search');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();

module.exports = function (name, options) {
  var offline = options && options.offline || false;
  var method = offline ? infoFromCache : infoFromAssetStore;

  return method(sanitize(name), options);
};

function infoFromCache(name, options) {
  return nfcall(glob, path.join(assetStoreDirectoryPath, '*', '*', format('%s.json', name)))
    .then(function (files) {
      if (!files.length) {
        throw new Error();
      }

      return nfcall(readJson, files[0]);
    });
}

function infoFromAssetStore(name, options) {
  return api.get('packages/search.json', { query: name, limit: 1 })
    .then(function (res) {
      if (!res.results.length) {
        throw new Error();
      }

      return api.get(format('packages/%s', res.results[0].id));
    })
    .then(function (res) {
      var category = sanitize(res.content.category.label_file);
      var publisher = sanitize(res.content.publisher.label_file);
      var title = sanitize(res.content.title_file);

      var dir = path.join(assetStoreDirectoryPath, publisher, category);
      var filename = path.join(dir, format('%s.json', title));
      var contents = JSON.stringify(res.content, null, '  ');

      return nfcall(mkdirp, dir)
        .then(function () { return nfcall(fs.writeFile, filename, contents); })
        .then(function () { return res.content; });
    });
}
