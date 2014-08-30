'use strict';

var format = require('util').format;

var archy = require('archy');
var RcLoader = require('rcloader');

var nfcall = require('../lib/nfcall');

module.exports = function () {
  var loader = new RcLoader('.asset-store-packages');

  return nfcall(loader.for, './')
    .then(function (dotfile) {
      var packages = Object.keys(dotfile.packages).map(function (name) {
        var version = dotfile.packages[name];
        return { label: format('%s@%s', name, version) };
      });

      return { label: dotfile.directory, nodes: packages };
    })
    .then(archy);
};
