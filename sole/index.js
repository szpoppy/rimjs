"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ====================================================================== 获取页面唯一的 id 值
// jsonp和禁止使用缓存中使用
var soleTime = new Date().getTime() - 1000000;
var soleCount = 1000;
function sole() {
    soleCount += 1;
    return Number(Math.round((Math.random() + 1) * 1000000) + (new Date().getTime() - soleTime) + "" + soleCount).toString(36);
}
exports.default = sole;
//# sourceMappingURL=index.js.map