"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var each_1 = require("../each");
// 用于类型判断
var _toString = Object.prototype.toString;
function _assign(target, objs, flag) {
    if (flag === void 0) { flag = false; }
    each_1.default(objs, function (source) {
        each_1.default(source, function (item, n) {
            if (item) {
                var type = _toString.call(item).toLowerCase();
                if (type == "[object date]") {
                    target[n] = new Date(item.getTime());
                    return;
                }
                if (target[n] != null) {
                    var targetType = _toString.call(target[n]).toLowerCase();
                    if (type == "[object array]") {
                        if (!flag && targetType != type) {
                            target[n] = [];
                        }
                        _assign(target[n], item, flag);
                        return;
                    }
                    if (type == "[object object]") {
                        if (!flag && targetType != type) {
                            target[n] = {};
                        }
                        _assign(target[n], item, flag);
                        return;
                    }
                }
            }
            target[n] = item;
        });
    });
    return target;
}
/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同　target 的数据类型一致
 */
function merge(target) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    return _assign(target, objs, true);
}
exports.merge = merge;
/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同　target 的数据类型一致
 */
function assign(target) {
    var objs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objs[_i - 1] = arguments[_i];
    }
    return _assign(target, objs, false);
}
exports.assign = assign;
exports.default = assign;
//# sourceMappingURL=index.js.map