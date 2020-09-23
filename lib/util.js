"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isFn = exports.isFn = function isFn(s) {
  return typeof s === "function";
};
var isObject = exports.isObject = function isObject(s) {
  return (typeof s === "undefined" ? "undefined" : _typeof(s)) === "object" && s !== null;
};