"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseCache = void 0;
var Cache = /** @class */ (function () {
    function Cache() {
        this.backs = [];
        this.inited = 0;
        this.date = new Date().getTime();
    }
    Cache.prototype.setData = function (data) {
        this.data = data;
        this.inited = 2;
        while (this.backs.length) {
            var fn = this.backs.shift();
            fn(this.data);
        }
    };
    return Cache;
}());
function promiseCache(getFn, eTime) {
    if (eTime === void 0) { eTime = 0; }
    var caches = {};
    return function (key) {
        if (key === void 0) { key = ":default"; }
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
                getFn(function (data) {
                    cache.setData(data);
                }, key);
            }
        });
    };
}
exports.promiseCache = promiseCache;
exports.default = {
    promise: promiseCache
};
//# sourceMappingURL=index.js.map