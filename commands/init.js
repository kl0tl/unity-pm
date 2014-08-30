'use strict';

var fs = require('fs');

var installCommand = require('./install');
var nfcall = require('../lib/nfcall');

module.exports = function (directory, packages) {
  var contents = JSON.stringify({ directory: directory, packages: {} }, null, '  ');

  return nfcall(fs.writeFile, contents)
    .then(function () {
      if (packages && packages.length) {
        return Promise.all(packages).map(installCommand);
      }
    });
};
