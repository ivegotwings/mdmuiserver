let isObject = require("./isObject");
let hasOwn = Object.prototype.hasOwnProperty;

module.exports = function(obj, prop) {
  return isObject(obj) && hasOwn.call(obj, prop);
};
