"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cache = /** @class */ (function () {
    function Cache() {
        this.backs = [];
        this.inited = 0;
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
function promiseCache(getFn) {
    var caches = {};
    return function (key) {
        if (key === void 0) { key = ":default"; }
        var cache = caches[key];
        if (!cache) {
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