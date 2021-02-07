"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyQS = exports.parseQS = exports.QueryString = void 0;
var QueryString = /** @class */ (function () {
    function QueryString(opt) {
        this.sep = "&";
        this.eq = "=";
        this.unescape = decodeURIComponent;
        this.escape = encodeURIComponent;
        if (opt) {
            Object.assign(this, opt);
        }
    }
    /**
     * 解析为 对象输出
     * @param str
     */
    QueryString.prototype.parse = function (str) {
        var sep = this.sep;
        var eq = this.eq;
        var unescape = this.unescape;
        var data = {};
        // 去除部分没有的字符
        str.replace(/^[\s#?]+/, "")
            .split(sep)
            .forEach(function (item) {
            if (!item) {
                return;
            }
            var arr = item.split(eq);
            var key = arr[0];
            if (key) {
                var val = unescape(arr[1] || "");
                if (data[key] === undefined) {
                    // 赋值
                    data[key] = val;
                }
                else if (data[key].push) {
                    // 多个相同字符
                    data[key].push(val);
                }
                else {
                    // 值转化为数组
                    data[key] = [data[key], val];
                }
            }
        });
        return data;
    };
    /**
     * 序列化为字符串
     * @param opt
     */
    QueryString.prototype.stringify = function (opt) {
        var sep = this.sep;
        var eq = this.eq;
        var escape = this.escape;
        var arr = [];
        var _loop_1 = function (n) {
            var item = opt[n];
            if (item == null) {
                item = "";
            }
            var key = escape(n);
            if (item && item.constructor == Array) {
                // 数组要转化为多个相同kv
                item.forEach(function (one) {
                    arr.push(key + eq + escape(one));
                });
            }
            else {
                arr.push(key + eq + escape(item));
            }
        };
        for (var n in opt) {
            _loop_1(n);
        }
        return arr.join(sep);
    };
    return QueryString;
}());
exports.QueryString = QueryString;
var qs = Object.assign(new QueryString(), { QueryString: QueryString });
function parseQS(str) {
    return qs.parse(str);
}
exports.parseQS = parseQS;
function stringifyQS(opt) {
    return qs.stringify(opt);
}
exports.stringifyQS = stringifyQS;
exports.default = qs;
//# sourceMappingURL=index.js.map