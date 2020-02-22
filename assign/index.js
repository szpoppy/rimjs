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
                        _assign(target[n], [item], flag);
                        return;
                    }
                    if (type == "[object object]") {
                        if (!flag && targetType != type) {
                            target[n] = {};
                        }
                        _assign(target[n], [item], flag);
                        return;
                    }
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
    return _assign(target, sources);
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