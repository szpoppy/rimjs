"use strict";
/**
 * 事件类
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
function emitEvent(events, target, args) {
    for (var i = 0; i < events.length; i += 1) {
        events[i].apply(target, args);
    }
}
var Event = /** @class */ (function () {
    function Event(parent) {
        this._events = {};
        if (parent) {
            this.parent = parent;
        }
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
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    Event.prototype.emit = function (target, type) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (typeof target == "string") {
            args.unshift(type);
            type = target;
            target = this;
        }
        var parent = this.parent;
        if (parent && parent.emit) {
            parent.emit.apply(parent, __spreadArrays([target, type], args));
        }
        var evs = this._events[type] || [];
        for (var i = 0; i < evs.length; i += 1) {
            evs[i].apply(target, args);
        }
        return args[0];
    };
    /**
     * 判断事件是否存在
     * @param type
     */
    Event.prototype.hasEvent = function (type) {
        var evs = this._events[type] || [];
        return evs.length > 0;
    };
    return Event;
}());
exports.default = Event;
//# sourceMappingURL=index.js.map