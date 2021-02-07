"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCookie = exports.setCookie = exports.getCookie = void 0;
function getExpiration(expiration) {
    if (typeof expiration === "number") {
        if (expiration == -1) {
            // 永久
            return new Date("3000/01/01");
        }
        // 数字，为 天数
        return new Date(new Date().getTime() + expiration * 24 * 60 * 60 * 1000);
    }
    if (typeof expiration === "string") {
        var match = expiration.match(/^\s*(\d)+\s*([dhm])\s*$/);
        if (match) {
            var date = new Date();
            switch (match[2]) {
                case "d":
                    date.setDate(date.getDate() + parseInt(match[1]));
                    break;
                case "m":
                    date.setMinutes(date.getMinutes() + parseInt(match[1]));
                    break;
                case "h":
                    date.setHours(date.getHours() + parseInt(match[1]));
                    break;
            }
            return date;
        }
        return new Date(expiration
            .replace(/-/g, "/")
            .replace(/T/, " ")
            .replace(/\.\d*$/, ""));
    }
    return expiration;
}
/**
 * 获取cookie
 * @param {String} key
 */
function getCookie(key) {
    return new RegExp("; ?" + key + "=([^;]*);?").test("; " + document.cookie) ? decodeURIComponent(RegExp.$1) : "";
}
exports.getCookie = getCookie;
/**
 * 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
 * @param {Number|String|Date} expiration 1d 1天 1h 1小时 1m 1分钟
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
function setCookie(key, value, expiration, path, domain) {
    if (expiration === void 0) { expiration = 0; }
    var str = key + "=" + encodeURIComponent(value);
    if (expiration) {
        str += "; expires=" + getExpiration(expiration).toString();
    }
    if (path) {
        str += "; path=" + path;
    }
    if (domain) {
        str += "; domain=" + domain;
    }
    document.cookie = str;
}
exports.setCookie = setCookie;
/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
function removeCookie(key, path, domain) {
    var str = key + "=; expires=" + new Date(0).toString();
    if (path) {
        str += "; path=" + path;
    }
    if (domain) {
        str += "; domain=" + domain;
    }
    document.cookie = str;
}
exports.removeCookie = removeCookie;
// 预先设置好 过期时间 路径 域名
var Cookie = /** @class */ (function () {
    function Cookie(_a) {
        var _b = _a === void 0 ? { expiration: 0 } : _a, expiration = _b.expiration, path = _b.path, domain = _b.domain;
        this.expiration = getExpiration(expiration);
        if (path) {
            this.path = path;
        }
        if (domain) {
            this.domain = domain;
        }
    }
    Cookie.prototype.getItem = function (key) {
        return getCookie(key);
    };
    Cookie.prototype.setItem = function (key, value) {
        return setCookie(key, value, this.expiration, this.path, this.domain);
    };
    Cookie.prototype.removeItem = function (key) {
        removeCookie(key, this.path, this.domain);
    };
    // 获取
    Cookie.getItem = getCookie;
    // 设置
    Cookie.setItem = setCookie;
    // 移除
    Cookie.removeItem = removeCookie;
    return Cookie;
}());
exports.default = Cookie;
//# sourceMappingURL=index.js.map