"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_1 = __importDefault(require("../date"));
var event_1 = __importDefault(require("../event"));
/**
 * 获取当前时间，可以更改为获取当前服务器时间
 */
var getNow = function () {
    return date_1.default.parse();
};
var TimeEventData = /** @class */ (function () {
    function TimeEventData() {
        this.diff = "";
        this.spt = 0;
    }
    return TimeEventData;
}());
var TimeEvent = /** @class */ (function (_super) {
    __extends(TimeEvent, _super);
    function TimeEvent(time, diffText) {
        var _this = _super.call(this) || this;
        // 结束时间
        _this.endNum = 0;
        _this.prevNum = 0;
        _this.diffText = "<hh:时><mm:分>ss秒";
        _this.isStop = false;
        _this.toStop = false;
        if (time) {
            _this.setEndNum(time);
        }
        if (diffText) {
            _this.diffText = diffText;
        }
        return _this;
    }
    TimeEvent.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        this[":on"](type, fn, isPre);
        return this;
    };
    TimeEvent.prototype.setEndNum = function (time) {
        if (typeof time == "number") {
            time = date_1.default.parse().getTime() + time * 1000;
        }
        this.endNum = date_1.default.parse(time).getTime();
    };
    TimeEvent.prototype.emitDiff = function () {
        if (this.isStop) {
            return false;
        }
        return one(this);
    };
    TimeEvent.prototype.stop = function () {
        if (!this.isStop) {
            this.toStop = true;
        }
    };
    TimeEvent.prototype.getNow = function () {
        return getNow();
    };
    return TimeEvent;
}(event_1.default));
var queue = [];
var interval = null;
/**
 * 执行一次 一个 循环
 * @param {*} x
 */
function one(x) {
    var ev = new TimeEventData();
    if (!x.isStop && x.toStop) {
        x.toStop = false;
        x.emit("change", ev);
        return false;
    }
    var spt = Math.floor((x.endNum - x.getNow().getTime()) / 1000);
    ev.spt = spt;
    if (x.prevNum != spt) {
        // 本次时差与上一次有差异，就执行回调
        // 当spt <= 0 为最后一次回调
        var diff = date_1.default.diff(spt * 1000, x.diffText);
        ev.diff = diff;
        x.prevNum = spt;
        if (spt <= 0) {
            x.isStop = true;
            x.emit("end", ev);
        }
        else {
            x.emit("change", ev);
        }
    }
    return spt > 0;
}
function step() {
    if (queue.length) {
        for (var i = 0; i < queue.length;) {
            if (one(queue[i])) {
                // 下一个
                i += 1;
            }
            else {
                // 移除
                queue.splice(i, 1);
            }
        }
    }
    else {
        // 无队列，移除 interval
        clearInterval(interval);
        interval = null;
    }
}
/**
 * 倒计时 函数
 * @param {Number|String|Date} time 为数字时，代表，需要执行多少秒的倒计时
 * @return {eventemitter} 自定义事件对象
 * @event change 事件，剩余时间 改变时触发，两个参数 第一个 diff 字符串 第二个diff（秒）
 * @event end 倒计时结束时候调用
 */
function timeDown(time, diffText) {
    var one = new TimeEvent(time, diffText);
    queue.push(one);
    if (!interval) {
        interval = setInterval(step, 250);
    }
    return one;
}
/**
 * 设置默认的 获取当前时间的函数
 * @param {Function} fn
 */
function setGetNowFn(fn) {
    getNow = fn;
    return timeDown;
}
/**
 * 终止
 */
function stopAll() {
    queue.forEach(function (item) {
        item.stop();
    });
    queue = [];
    // 无队列，移除 interval
    clearInterval(interval);
    interval = null;
}
exports.default = Object.assign(timeDown, {
    stopAll: stopAll,
    setGetNowFn: setGetNowFn
});
//# sourceMappingURL=index.js.map