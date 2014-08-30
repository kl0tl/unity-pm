'use strict';

var format = require('util').format;
var path = require('path');

var archy = require('archy');
var glob = require('glob');
var Promise = require('native-promise-only');
var readJson = require('read-json');

var nfcall = require('../../lib/nfcall');
var infoCommand = require('../info');

var assetStoreDirectoryPath = require('unity-asset-store-directory')();

module.exports = function cacheListCommand() {
  return nfcall(glob, path.join(assetStoreDirectoryPath, '!(.*)'))
    .then(function (publishers) {
      return Promise.all(publishers.map(function (pathOfPublisher) {
        return new Publisher(pathOfPublisher);
      }));
    })
    .then(function (publishers) {
      return Promise.all(publishers.map(function (publisher) {
        return publisher.toNode();
      }));
    })
    .then(function (nodes) {
      return { label: assetStoreDirectoryPath, nodes: nodes };
    })
    .then(archy);
};

function UnityPackage(unityPackagePath) {
  this.name = path.basename(unityPackagePath, '.unitypackage');
  this.path = unityPackagePath;
}

UnityPackage.prototype.info = function () {
  var unityPackage = this;

  return nfcall(readJson, path.join(path.dirname(this.path), format('%s.json', this.name)))
    .catch(function () { return infoCommand(unityPackage.name); });
};

UnityPackage.prototype.version = function () {
  return this.info()
    .then(function (info) { return info.version; })
    .catch(function () { return '???'; });
};

UnityPackage.prototype.toNode = function () {
  var unityPackage = this;

  return this.version()
    .then(function (version) {
      return { label: format('%s@%s', unityPackage.name, version) };
    });
};

function Category(categoryPath) {
  this.name = path.basename(categoryPath);
  this.path = categoryPath;
}

Category.prototype.packages = function () {
  return nfcall(glob, path.join(this.path, '*.unitypackage'))
    .then(function (packages) {
      return packages.map(function (unityPackagePath) {
        return new UnityPackage(unityPackagePath);
      });
    });
};

Category.prototype.toNode = function () {
  var category = this;

  return this.packages()
    .then(function (packages) {
      return Promise.all(packages.map(function (unityPackage) {
        return unityPackage.toNode();
      }));
    })
    .then(function (nodes) {
      return { label: category.name, nodes: nodes };
    });
};

function Publisher(publisherPath) {
  this.name = path.basename(publisherPath);
  this.path = publisherPath;
}

Publisher.prototype.categories = function () {
  return nfcall(glob, path.join(this.path, '!(.*)'))
    .then(function (categories) {
      return categories.map(function (categoryPath) {
        return new Category(categoryPath);
      });
    });
};


Publisher.prototype.toNode = function () {
  var publisher = this;

  return this.categories()
    .then(function (categories) {
      return Promise.all(categories.map(function (category) {
        return category.toNode();
      }));
    })
    .then(function (nodes) {
      return { label: publisher.name, nodes: nodes };
    });
};
