"use strict";
/**
 * 事件类
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Event = /** @class */ (function () {
    function Event(parent) {
        this._events = {};
        if (parent) {
            this._parent = parent;
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
    };
    /**
     * 移除事件 可以移除全部事件
     * @param type
     * @param fn
     */
    Event.prototype.off = function (type, fn) {
        if (!type) {
            this._events = {};
            return;
        }
        if (!fn) {
            delete this._events[type];
            return;
        }
        var evs = this._events[type];
        if (!evs) {
            return;
        }
        var index = evs.indexOf(fn);
        if (index >= 0) {
            evs.splice(index, 1);
        }
    };
    Event.prototype._emit = function (target, type, arg) {
        if (this._parent && this._parent._emit) {
            this._parent._emit(target, type, arg);
        }
        var evs = this._events[type] || [];
        for (var i = 0; i < evs.length; i += 1) {
            evs[i].call(target, arg);
        }
        return arg;
    };
    /**
     * 内部调用 事件触发函数
     * @param target
     * @param type
     * @param args
     */
    Event.prototype.emit = function (type, arg) {
        return this._emit(this, type, arg);
    };
    /**
     * 判断事件是否存在
     * @param type
     */
    Event.prototype.hasEvent = function (type) {
        var target = this;
        do {
            var evs = target._events[type] || [];
            if (evs.length > 0) {
                return true;
            }
        } while ((target = target._parent));
        return false;
    };
    return Event;
}());
exports.default = Event;
//# sourceMappingURL=index.js.map