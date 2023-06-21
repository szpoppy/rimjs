"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeStorage = exports.setStorage = exports.getStorage = exports.LSClass = void 0;
var soleTime = new Date().getTime() - 1000000;
var soleCount = 1000;
// 获取页面唯一的值
function getOne() {
    soleCount;
    soleCount += 1;
    var rnd = (Math.round((Math.random() + 1) * 1000000) + (new Date().getTime() - soleTime)).toString();
    return parseInt(rnd + "" + soleCount.toString()).toString(36);
}
// 本地存储引用
// 无本地存储，模拟本地实现
// 数据存储本地，无法长期存储
// 缓解无痕模式无法存储的问题
var LSStore = {};
var LS = {
    getItem: function (key) {
        return LSStore[key];
    },
    setItem: function (key, val) {
        LSStore[key] = val;
    },
    removeItem: function (key) {
        try {
            delete LSStore[key];
        }
        catch (e) { }
    }
};
var SSStore = {};
var SS = {
    getItem: function (key) {
        return SSStore[key];
    },
    setItem: function (key, val) {
        SSStore[key] = val;
    },
    removeItem: function (key) {
        try {
            delete SSStore[key];
        }
        catch (e) { }
    }
};
// 本地存储是否可以使用
try {
    window.localStorage.setItem("ls_can", "1");
    if (window.localStorage.getItem("ls_can") == "1") {
        LS = window.localStorage;
        SS = window.sessionStorage;
    }
}
catch (e) { }
var sKeyKey = ":store-s-key";
var sKey = SS.getItem(sKeyKey);
if (!sKey) {
    sKey = getOne();
    SS.setItem(sKeyKey, sKey);
}
// 移除
function remove(key) {
    LS.removeItem(key);
}
// 日期上增加特定时间
var appendTimeOpt = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
};
/**
 * 本地存储分组类
 */
var LSClass = /** @class */ (function () {
    /**
     * pre 为前置参数
     * @param pre
     */
    function LSClass(pre) {
        this.preposition = ":";
        if (pre) {
            this.preposition = pre;
        }
    }
    /**
     * 获取本地存储
     * @param key key
     */
    LSClass.prototype.getItem = function (key) {
        key = this.preposition + key;
        var val = LS.getItem(key);
        var json;
        try {
            json = JSON.parse(val);
        }
        catch (e) {
            return;
        }
        if (json) {
            // 检测是否过期
            var expiration = json.expiration;
            var isOut = false;
            if (expiration) {
                var now = new Date().getTime();
                if (expiration !== -1 && now > expiration) {
                    // 过期
                    isOut = true;
                }
            }
            var session = json.session;
            if (!isOut && session && session != sKey) {
                // 过期
                isOut = true;
            }
            if (isOut) {
                remove(key);
                return null;
            }
            return json.item;
        }
        return null;
    };
    /**
     * 设置本地存储
     * @param key
     * @param value 存入的值
     * @param expiration 过期时间
     */
    LSClass.prototype.setItem = function (key, value, expiration) {
        if (expiration === void 0) { expiration = 0; }
        key = this.preposition + key;
        var json = { item: value };
        if (typeof expiration == "number") {
            if (expiration === 0) {
                json.session = sKey;
            }
            else if (expiration === -1) {
                json.expiration = -1;
            }
            else {
                json.expiration = new Date().getTime() + expiration;
            }
        }
        else if (typeof expiration == "string") {
            if (/^(\d+)([a-z])$/i.test(expiration)) {
                var num = parseInt(RegExp.$1) * (appendTimeOpt[RegExp.$2.toLowerCase()] || 0);
                json.expiration = new Date().getTime() + num;
            }
            else {
                json.expiration = new Date(expiration
                    .replace(/-/g, "/")
                    .replace(/T/, " ")
                    .replace(/\.\d*$/, "")).getTime();
            }
        }
        else if (expiration instanceof Date) {
            json.expiration = expiration.getTime();
        }
        LS.setItem(key, JSON.stringify(json));
    };
    /**
     * 移除数据
     * @param key
     */
    LSClass.prototype.removeItem = function (key) {
        remove(this.preposition + key);
    };
    return LSClass;
}());
exports.LSClass = LSClass;
/**
 * 输出类
 */
var ls = Object.assign(new LSClass(":"), { LSClass: LSClass });
exports.getStorage = ls.getItem;
exports.setStorage = ls.setItem;
exports.removeStorage = ls.removeItem;
exports.default = ls;
//# sourceMappingURL=index.js.map