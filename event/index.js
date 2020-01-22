"use strict";
/**
 * 事件类
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event() {
        this._events = {};
    }
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fn 事件函数
     * @param isPre 是否前面插入
     */
    Event.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        var evs = this._events[type];
        if (!evs) {
            evs = this._events[type] = [];
        }
        evs[isPre ? "unshift" : "push"](fn);
        return this;
    };
    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    Event.prototype.off = function (type, fn) {
        if (!type) {
            this._events = {};
            return this;
        }
        if (!fn) {
            delete this._events[type];
            return this;
        }
        var evs = this._events[type];
        if (!evs) {
            return this;
        }
        var index = evs.indexOf(fn);
        if (index >= 0) {
            evs.splice(index, 1);
        }
        return this;
    };
    /**
     * 触发事件
     * @param type
     * @param arg
     */
    Event.prototype.emit = function (type) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        var evs = this._events[type] || [];
        for (var i = 0; i < evs.length; i += 1) {
            evs[i].apply(this, arg);
        }
        return arg[0];
    };
    /**
     * 判断事件是否存在
     * @param type
     */
    Event.prototype.has = function (type) {
        var evs = this._events[type] || [];
        return evs.length > 0;
    };
    return Event;
}());
exports.default = Event;
//# sourceMappingURL=index.js.map