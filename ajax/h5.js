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
var lib_1 = require("./lib");
require("./browser");
__exportStar(require("./lib"), exports);
exports.ajaxUtil = {
    fixedURL: lib_1.fixedURL,
    toParam: lib_1.getParamString
};
exports.ajax = Object.assign(new lib_1.AjaxGroup(), { global: lib_1.ajaxGlobal, Group: lib_1.AjaxGroup, util: exports.ajaxUtil });
exports.default = exports.ajax;
//# sourceMappingURL=h5.js.map