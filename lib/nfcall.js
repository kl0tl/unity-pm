'use strict';

var Promise = require('native-promise-only');

module.exports = function nfcall(fn) {
  var args = Array.prototype.slice.call(arguments, 1);
  var context = this;

  return new Promise(function (resolve, reject) {
    fn.apply(context, args.concat(function (err, res) {
      if (err) reject(err);
      else resolve(res);
    }));
  });
};
