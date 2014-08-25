'use strict';

var path = require('path');

var glob = require('glob');
var archy = require('archy');
var nfcall = require('../../lib/nfcall');

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

function Package(pathOfPackage) {
  this.name = path.basename(pathOfPackage);
  this.path = pathOfPackage;
}

Package.prototype.toNode = function () {
  return Promise.resolve({ label: this.name });
};

function Category(pathOfCategory) {
  this.name = path.basename(pathOfCategory);
  this.path = pathOfCategory;
}

Category.prototype.packages = function () {
  return nfcall(glob, path.join(this.path, '*.unitypackage'))
    .then(function (packages) {
      return packages.map(function (pathOfPackage) {
        return new Package(pathOfPackage);
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

function Publisher(pathOfPublisher) {
  this.path = pathOfPublisher;
  this.name = path.basename(pathOfPublisher);
}

Publisher.prototype.categories = function () {
  return nfcall(glob, path.join(this.path, '!(.*)'))
    .then(function (categories) {
      return categories.map(function (pathOfCategory) {
        return new Category(pathOfCategory);
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
