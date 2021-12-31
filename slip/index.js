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
var event_1 = __importDefault(require("../event"));
var doc = window.document;
var isTouch = "ontouchstart" in doc;
var moveData = null;
function getEventXY(ev) {
    //移动是多点触控，默认使用第一个作为clientX和clientY
    if (ev.clientX == null) {
        var touches = ev.targetTouches && ev.targetTouches[0] ? ev.targetTouches : ev.changedTouches;
        if (touches && touches[0]) {
            ev.clientX = touches[0].clientX;
            ev.clientY = touches[0].clientY;
            return [touches[0].clientX, touches[0].clientY];
        }
    }
    return [ev.clientX, ev.clientY];
}
var events = {
    move: isTouch ? "touchmove" : "mousemove",
    down: isTouch ? "touchstart" : "mousedown",
    up: isTouch ? "touchend" : "mouseup"
};
function appendEvent(dom, type, fn, cap) {
    if (cap === void 0) { cap = false; }
    dom.addEventListener(events[type], fn, !!cap);
}
function removeEvent(dom, type, fn, cap) {
    if (cap === void 0) { cap = false; }
    dom.removeEventListener(events[type], fn, !!cap);
}
function getMax(m, c) {
    if (m == 0) {
        return c;
    }
    if (m < 0) {
        return c < m ? m : c > 0 ? 0 : c;
    }
    return c > m ? m : c < 0 ? 0 : c;
}
//鼠标移动开始
function slipDown(ev) {
    if (moveData) {
        return;
    }
    moveData = this;
    appendEvent(doc, "move", slipMove, true);
    appendEvent(doc, "up", slipUp, true);
    var _a = getEventXY(ev), x = _a[0], y = _a[1];
    this.bx = this.ax - x;
    this.by = this.ay - y;
    this.emit("start", ev);
}
function getSlipData(ev) {
    var _a = getEventXY(ev), x = _a[0], y = _a[1];
    var md = moveData;
    return {
        x: getMax(md.mx, x + md.bx),
        y: getMax(md.my, y + md.by),
        event: ev
    };
}
//鼠标移动中
function slipMove(evt) {
    if (moveData) {
        var x = window.getSelection && window.getSelection();
        if (x) {
            x.removeAllRanges();
        }
        moveData.emit("move", getSlipData(evt));
    }
}
//鼠标抬起
function slipUp(evt) {
    if (moveData) {
        removeEvent(doc, "up", slipUp, true);
        removeEvent(doc, "move", slipMove, true);
        var d = getSlipData(evt);
        var x = d.x, y = d.y;
        moveData.ax = x;
        moveData.ay = y;
        moveData.emit("end", d);
        moveData = null;
    }
}
var Slip = /** @class */ (function (_super) {
    __extends(Slip, _super);
    // 初始化
    function Slip(id, mx, my) {
        var _this = _super.call(this) || this;
        _this.ax = 0;
        _this.ay = 0;
        _this.mx = 0;
        _this.my = 0;
        _this.bx = 0;
        _this.by = 0;
        if (typeof id == "string") {
            var x = doc.getElementById(id);
            if (x) {
                id = x;
            }
        }
        if (!id) {
            // eslint-disable-next-line
            throw "no id element";
        }
        _this.dom = id;
        if (mx) {
            _this.mx = mx;
        }
        if (my) {
            _this.my = my;
        }
        appendEvent(_this.dom, "down", slipDown.bind(_this), false);
        return _this;
    }
    Slip.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        this[":on"](type, fn, isPre);
    };
    // 清理
    Slip.prototype.setSkewing = function (x, y) {
        this.ax = getMax(this.mx, x || 0);
        this.ay = getMax(this.my, y || 0);
        return [this.ax, this.ay];
    };
    return Slip;
}(event_1.default));
exports.default = Slip;
//# sourceMappingURL=index.js.map