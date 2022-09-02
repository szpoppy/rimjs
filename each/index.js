"use strict";
/**
 * 数据循环
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.each = void 0;
// 用于类型判断
var _toString = Object.prototype.toString;
// 数组push
function forPush(arr, v) {
    arr.push(v);
}
// 对象增加k-v
function forAppend(obj, v, k) {
    obj[k] = v;
}
// 普通
function forBack() { }
// 支持for循环的 数据
var forTypes = "-[object array]-[object nodelist]-[object htmlcollection]-[object arguments]-";
function each(arr, fn, exe) {
    // 终止循环
    var isStop = false;
    function stop() {
        isStop = true;
    }
    if (arr) {
        var doExe = forBack;
        if (exe) {
            doExe = exe instanceof Array ? forPush : forAppend;
        }
        var len = arr.length;
        if (forTypes.indexOf("-" + _toString.call(arr).toLowerCase() + "-") > -1) {
            for (var i = 0; i < len; i += 1) {
                var item = fn(arr[i], i, stop);
                if (isStop) {
                    break;
                }
                doExe(exe, item, i);
            }
        }
        else {
            for (var n in arr) {
                // eslint-disable-next-line
                if (!arr.hasOwnProperty || arr.hasOwnProperty(n)) {
                    var item = fn(arr[n], n, stop);
                    if (isStop) {
                        break;
                    }
                    doExe(exe, item, n);
                }
            }
        }
    }
    return exe;
}
exports.each = each;
exports.default = each;
//# sourceMappingURL=index.js.map