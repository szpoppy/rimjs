"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 获取cookie
 * @param {String} key
 */
function getItem(key) {
    return new RegExp("; ?" + key + "=([^;]*);?").test("; " + document.cookie) ? decodeURIComponent(RegExp.$1) : "";
}
exports.getItem = getItem;
/**
 * 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
function setItem(key, value, expiration, path, domain) {
    var str = key + "=" + encodeURIComponent(value);
    if (expiration) {
        if (typeof expiration === "number") {
            // 数字，为 天数
            expiration = new Date(new Date().getTime() + expiration * 24 * 60 * 60 * 1000);
        }
        else if (typeof expiration === "string") {
            expiration = new Date(expiration
                .replace(/\-/g, "/")
                .replace(/T/, " ")
                .replace(/\.\d*$/, ""));
        }
        str += "; expires=" + expiration.toString();
    }
    if (path) {
        str += "; path=" + path;
    }
    if (domain) {
        str += "; domain=" + domain;
    }
    document.cookie = str;
}
exports.setItem = setItem;
/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
function removeItem(key, path, domain) {
    var str = key + "=; expires=" + new Date(0).toString();
    if (path) {
        str += "; path=" + path;
    }
    if (domain) {
        str += "; domain=" + domain;
    }
    document.cookie = str;
}
exports.removeItem = removeItem;
//# sourceMappingURL=index.js.map