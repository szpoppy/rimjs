"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullUrl = void 0;
// ===================================================================== 获得url的真实地址
// 判断请求是否为跨域使用
var linkA = document.createElement("a");
function getFullUrl(url) {
    linkA.setAttribute("href", url);
    return linkA.href;
}
exports.getFullUrl = getFullUrl;
exports.default = getFullUrl;
//# sourceMappingURL=getFullUrl.js.map