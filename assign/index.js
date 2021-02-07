"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = exports.merge = void 0;
var each_1 = require("../each");
// 用于类型判断
var _toString = Object.prototype.toString;
function _assign(target, objs, flag) {
    if (flag === void 0) { flag = false; }
    each_1.default(objs, function (source) {
        each_1.default(source, function (item, n) {
            if (item) {
                var type = _toString.call(item).toLowerCase();
                var isTArr = type == "[object array]";
                var isTObj = type == "[object object]";
                if (type == "[object date]") {
                    target[n] = new Date(item.getTime());
                    return;
                }
                var targetType = _toString.call(target[n]).toLowerCase();
                if (isTArr || isTObj) {
                    // 数组 或者 对象
                    if (target[n] == null || (!flag && targetType != type)) {
                        target[n] = isTArr ? [] : {};
                    }
                    _assign(target[n], [item], flag);
                    return;
                }
            }
            target[n] = item;
        });
    });
    return target;
}
function merge(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    return _assign(target, sources, true);
}
exports.merge = merge;
function assign(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    return _assign(target, sources, false);
}
exports.assign = assign;
exports.default = {
    merge: merge,
    assign: assign
};
//# sourceMappingURL=index.js.map