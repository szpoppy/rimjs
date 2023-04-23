"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseCache = void 0;
var Cache = /** @class */ (function () {
    function Cache() {
        this.backs = [];
        this.inited = 0;
        this.date = new Date().getTime();
    }
    Cache.prototype.setData = function (data, inited) {
        if (inited === void 0) { inited = true; }
        if (inited == 2 || inited === true) {
            // 为0，异常，不更新
            this.data = data;
        }
        this.inited = inited ? 2 : 0;
        while (this.backs.length) {
            var fn = this.backs.shift();
            fn(data);
        }
    };
    return Cache;
}());
function getKeyDef(para) {
    if (typeof para == "string") {
        return para;
    }
    if (para && para.toString) {
        return para.toString();
    }
    return ":default";
}
function promiseCache(getFn, eTime, getKey) {
    if (eTime === void 0) { eTime = 0; }
    if (getKey === void 0) { getKey = getKeyDef; }
    var caches = {};
    var cacheFn = function (para) {
        if (para === void 0) { para = null; }
        var key = getKey(para);
        var cache = caches[key];
        if (cache && cache.inited == 2 && eTime > 0 && cache.date + eTime < new Date().getTime()) {
            // 已经过期了
            cache.inited = 0;
        }
        if (!cache) {
            // 不存在或者过期了
            cache = caches[key] = new Cache();
        }
        // 直接返回已经存在
        return new Promise(function (resolve) {
            if (cache.inited > 1) {
                resolve(cache.data);
                return;
            }
            cache.backs.push(resolve);
            if (cache.inited < 1) {
                cache.inited = 1;
                getFn(function (data, inited) {
                    cache.setData(data, inited);
                }, para);
            }
        });
    };
    cacheFn.caches = caches;
    return cacheFn;
}
exports.promiseCache = promiseCache;
exports.default = {
    promise: promiseCache
};
//# sourceMappingURL=index.js.map