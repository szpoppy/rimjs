"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadJS = void 0;
// jsonp 加载方式需要使用
var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
function loadJS(url, callback) {
    // 创建节点
    var node = document.createElement("script");
    // 设置属性
    node.setAttribute("type", "text/javascript");
    node.onload = node.onerror = function () {
        node.onload = node.onerror = null;
        callback && callback();
        setTimeout(function () {
            //防止回调的时候，script还没执行完毕
            // 延时 2s 删除节点
            if (node) {
                var parent_1 = node.parentNode;
                parent_1.removeChild(node);
            }
        }, 2000);
    };
    node.async = true;
    head.appendChild(node);
    node.src = url;
    return node;
}
exports.loadJS = loadJS;
exports.default = loadJS;
//# sourceMappingURL=loadJS.js.map