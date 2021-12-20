"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajax = exports.ajaxUtil = void 0;
/*
function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = require('./adapters/xhr');
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
        // For node use HTTP adapter
        adapter = require('./adapters/http');
    }
    return adapter;
}
*/
var lib_1 = require("./lib");
__exportStar(require("./lib"), exports);
exports.ajaxUtil = {
    fixedURL: lib_1.fixedURL,
    toParam: lib_1.getParamString
};
(function () {
    if (typeof process !== "undefined" && Object.prototype.toString.call(process) === "[object process]") {
        // node
        require("./node-http");
        return;
    }
    // 浏览器
    require("./browser");
})();
exports.ajax = Object.assign(new lib_1.AjaxGroup(), { global: lib_1.ajaxGlobal, Group: lib_1.AjaxGroup, util: exports.ajaxUtil });
exports.default = exports.ajax;
//# sourceMappingURL=index.js.map