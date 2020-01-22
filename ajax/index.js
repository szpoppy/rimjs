"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var qs_1 = require("../qs");
// 用于类型判断
var _toString = Object.prototype.toString;
// 当前host
var host = window.location.host;
// 是否原声支持 fetch
var hasFetch = !!window.fetch;
// ========================================================================= 动态加载js
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
                node.parentNode.removeChild(node);
                node = null;
            }
        }, 2000);
    };
    node.async = true;
    head.appendChild(node);
    node.src = url;
    return node;
}
// ===================================================================== 获得url的真实地址
// 判断请求是否为跨域使用
var linkA = document.createElement("a");
function getFullUrl(url) {
    linkA.setAttribute("href", url);
    return linkA.href;
}
// ===================================================================== 安全获取子对象数据
function getSafeData(data, property) {
    if (property && data) {
        property.split(".").forEach(function (item) {
            data = data[item];
            if (data == null) {
                return false;
            }
        });
    }
    return data;
}
// ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
function fixedURL(url, paramStr) {
    if (paramStr) {
        return url + (url.indexOf("?") > -1 ? "&" : "?") + paramStr;
    }
    return url;
}
// ===================================================================== 参数转为 字符串
function getParamString(param, dataType) {
    if (!param) {
        return "";
    }
    if (param instanceof window.FormData) {
        return param;
    }
    if (typeof param == "string") {
        return param || "";
    }
    var str = dataType == "json" ? JSON.stringify(param) : qs_1.default.stringify(param);
    return str;
}
// ===================================================================== 获取默认的 Content-Type 的值
function getDefaultContentType(dataType) {
    if (dataType == "json") {
        return "application/json";
    }
    return "application/x-www-form-urlencoded";
}
// ==================================================================== 资源返回类
var Req = /** @class */ (function () {
    function Req() {
    }
    return Req;
}());
var Res = /** @class */ (function () {
    function Res() {
        this.jsonKey = "json";
    }
    Res.prototype.getDate = function () {
        return this.root.root.getDate();
    };
    Res.prototype.getData = function (prot, data) {
        if (data === undefined) {
            data = this[this.jsonKey];
        }
        return getSafeData(data, prot);
    };
    Res.prototype.getHeader = function (key) {
        if (typeof this.headers == "string") {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.headers) ? RegExp["$1"] : "";
        }
        if (this.headers instanceof Headers) {
            return this.headers.get(key);
        }
        return "";
    };
    return Res;
}());
var Ajax = /** @class */ (function () {
    function Ajax() {
    }
    return Ajax;
}());
var Group = /** @class */ (function () {
    function Group() {
        this.dateDiff = 0;
    }
    Group.prototype.setDate = function (date) {
        if (typeof date == "string") {
            date = new Date(date.replace(/T/, " ").replace(/\.\d+$/, ""));
        }
        this.dateDiff = date.getTime() - new Date().getTime();
    };
    // 获取 服务器时间
    Group.prototype.getDate = function () {
        return new Date(this.dateDiff + new Date().getTime());
    };
    return Group;
}());
// 结束 统一处理返回的数据
function responseEnd(res) {
    var req = res.withReq;
    if (!res.json && res.text) {
        // 尝试格式为 json字符串
        try {
            res.json = JSON.parse(res.text);
        }
        catch (e) {
            res.json = {};
        }
    }
    if (req.resType == "json") {
        res.result = res.json;
    }
    var date = res.getHeader("Date");
    if (date) {
        this.root.setDate(date);
    }
    delete this._req;
    // 出发验证事件
    this.emit("verify", res);
    if (res.cancel === true) {
        // 验证事件中设置 res.cancel 为false，中断处理
        return;
    }
    // callback事件，可以看做函数回调
    this.emit("callback", res);
}
//# sourceMappingURL=index.js.map