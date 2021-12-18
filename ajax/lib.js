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
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseEnd = exports.ajaxGlobal = exports.Global = exports.AjaxGroup = exports.Ajax = exports.AjaxCourse = exports.AjaxRes = exports.AjaxReq = exports.getDefaultContentType = exports.getParamString = exports.fixedURL = void 0;
var event_1 = require("../event");
var assign_1 = require("../assign");
var sole_1 = require("../sole");
var qs = require("querystring");
// ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
function fixedURL(url, paramStr) {
    if (paramStr) {
        return url + (url.indexOf("?") > -1 ? "&" : "?") + paramStr;
    }
    return url;
}
exports.fixedURL = fixedURL;
// ===================================================================== 参数转为 字符串
function getParamString(param, dataType) {
    if (!param) {
        return "";
    }
    // if (param instanceof FormData) {
    //     return param
    // }
    if (typeof param == "string") {
        return param || "";
    }
    var str = dataType == "json" ? JSON.stringify(param) : qs.stringify(param);
    return str;
}
exports.getParamString = getParamString;
// ===================================================================== 获取默认的 Content-Type 的值
function getDefaultContentType(dataType) {
    if (dataType == "json") {
        return "application/json";
    }
    return "application/x-www-form-urlencoded";
}
exports.getDefaultContentType = getDefaultContentType;
// ===================================================================== 安全获取子对象数据
function getSafeData(data, property) {
    if (property && data) {
        var props = property.split(".");
        for (var i = 0; i < props.length; i += 1) {
            data = data[props[i]];
            if (data == null) {
                return null;
            }
        }
    }
    return data;
}
var EResType;
(function (EResType) {
    // eslint-disable-next-line
    EResType["json"] = "json";
    // eslint-disable-next-line
    EResType["text"] = "text";
})(EResType || (EResType = {}));
// ==================================================================== 资源返回类
var AjaxReq = /** @class */ (function () {
    function AjaxReq() {
        this.paths = {};
        this.useFetch = true;
        this.url = "";
        this.method = "GET";
        this.dataType = "";
        this.resType = EResType.text;
        this.header = {};
        this.jsonpKey = "";
        this.cache = false;
        this.withCredentials = true;
        this.path = "";
        this.orginURL = "";
        this.formatURL = "";
        this.isFormData = false;
        this.isCross = false;
        this.outFlag = false;
        // constructor() {}
    }
    return AjaxReq;
}());
exports.AjaxReq = AjaxReq;
var AjaxRes = /** @class */ (function () {
    function AjaxRes() {
        this.jsonKey = "json";
        this.headers = "";
    }
    // constructor() {}
    AjaxRes.prototype.getData = function (prot, data) {
        if (data === undefined) {
            data = this[this.jsonKey];
        }
        return getSafeData(data, prot);
    };
    AjaxRes.prototype.getHeader = function (key) {
        if (typeof this.headers == "string") {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.headers) ? RegExp.$1 : "";
        }
        return (this.headers.get && this.headers.get(key)) || "";
    };
    return AjaxRes;
}());
exports.AjaxRes = AjaxRes;
var AjaxCourse = /** @class */ (function () {
    function AjaxCourse(ajax) {
        this.req = new AjaxReq();
        this.res = new AjaxRes();
        this.ajax = ajax;
    }
    AjaxCourse.prototype.getDate = function () {
        return this.ajax.parent.getDate();
    };
    return AjaxCourse;
}());
exports.AjaxCourse = AjaxCourse;
var Ajax = /** @class */ (function (_super) {
    __extends(Ajax, _super);
    function Ajax(parent, opt) {
        var _this = _super.call(this, parent) || this;
        _this.parent = parent;
        _this.conf = assign_1.merge({}, exports.ajaxGlobal.conf, parent.conf, getConf(opt));
        return _this;
    }
    Ajax.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        this[":on"](type, fn, isPre);
    };
    // 设置参数
    Ajax.prototype.setConf = function (opt) {
        if (opt === void 0) { opt = {}; }
        getConf(opt, this.conf);
        return this;
    };
    // 中止 请求
    Ajax.prototype.abort = function () {
        ajaxAbort(this, true);
        return this;
    };
    // 超时
    Ajax.prototype.timeout = function (time, callback) {
        var _this = this;
        setTimeout(function () {
            var course = _this._course;
            if (course) {
                var req = course.req;
                if (req) {
                    // 超时 设置中止
                    ajaxAbort(_this);
                    // 出发超时事件
                    _this.emit("timeout", course);
                }
            }
        }, time);
        callback && this.on("timeout", callback);
        return this;
    };
    // 发送数据， over 代表 是否要覆盖本次请求
    Ajax.prototype.send = function (param, over) {
        var _this = this;
        if (over === void 0) { over = false; }
        if (this._course) {
            // 存在 _req
            if (!over) {
                // 不覆盖，取消本次发送
                return this;
            }
            // 中止当前的
            this.abort();
        }
        // 制造 req
        var course = new AjaxCourse(this);
        var req = course.req;
        this._course = course;
        // 异步，settime 部分参数可以后置设置生效
        setTimeout(function () {
            assign_1.merge(req, _this.conf);
            requestSend.call(_this, param || {}, course);
        }, 1);
        return this;
    };
    Ajax.prototype.then = function (thenFn) {
        var _this = this;
        var pse = new Promise(function (resolve, reject) {
            _this.on("callback", function (course) {
                resolve(course);
            });
            _this.on("timeout", function () {
                // eslint-disable-next-line
                reject({ err: "访问超时", errType: 1 });
            });
            _this.on("abort", function () {
                // eslint-disable-next-line
                reject({ err: "访问中止", errType: 2 });
            });
        });
        return (thenFn && pse.then(thenFn)) || pse;
    };
    return Ajax;
}(event_1.default));
exports.Ajax = Ajax;
function groupLoad(target, url, callback, param, onNew) {
    var opt = typeof url == "string" ? { url: url } : url;
    if (callback && typeof callback != "function") {
        onNew = param;
        param = callback;
        callback = undefined;
    }
    var one = new Ajax(target, opt);
    onNew && onNew(one);
    if (typeof callback == "function") {
        one.on("callback", callback);
    }
    one.send(param);
    return one;
}
var ajaxDateDiff = 0;
var AjaxGroup = /** @class */ (function (_super) {
    __extends(AjaxGroup, _super);
    function AjaxGroup(opt) {
        var _this = _super.call(this, exports.ajaxGlobal) || this;
        _this.dateDiff = ajaxDateDiff;
        _this.conf = {};
        _this.conf = {};
        opt && _this.setConf(opt);
        return _this;
    }
    // Group?: AjaxGroupConstructor
    AjaxGroup.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        this[":on"](type, fn, isPre);
    };
    // 设置默认
    AjaxGroup.prototype.setConf = function (opt) {
        opt && getConf(opt, this.conf);
        return this;
    };
    // 创建一个ajax
    AjaxGroup.prototype.create = function (opt) {
        return new Ajax(this, opt);
    };
    // 快捷函数
    AjaxGroup.prototype.shortcut = function (opt, events) {
        var _this = this;
        return function (callback, param) {
            return groupLoad(_this, opt, callback, param, function (one) {
                if (events) {
                    if (typeof events == "function") {
                        one.on("callback", events);
                        return;
                    }
                    for (var n in events) {
                        one.on(n, events[n]);
                    }
                }
            });
        };
    };
    // 创建并加载
    AjaxGroup.prototype.load = function (url, callback, param, onNew) {
        return groupLoad(this, url, callback, param, onNew);
    };
    // promise
    AjaxGroup.prototype.fetch = function (opt, param, onNew) {
        return groupLoad(this, opt, param, onNew).then();
    };
    AjaxGroup.prototype.setDate = function (date) {
        if (typeof date == "string") {
            date = new Date(date.replace(/(\d)T(\d)/, "$1 $2").replace(/\.\d+$/, ""));
        }
        this.dateDiff = ajaxDateDiff = date.getTime() - new Date().getTime();
    };
    // 获取 服务器时间
    AjaxGroup.prototype.getDate = function () {
        return new Date(this.dateDiff + new Date().getTime());
    };
    return AjaxGroup;
}(event_1.default));
exports.AjaxGroup = AjaxGroup;
var Global = /** @class */ (function (_super) {
    __extends(Global, _super);
    function Global() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.conf = { useFetch: true, resType: EResType.json, jsonpKey: "callback", cache: true };
        return _this;
    }
    Global.prototype.on = function (type, fn, isPre) {
        if (isPre === void 0) { isPre = false; }
        this[":on"](type, fn, isPre);
    };
    // constructor() {
    //     super()
    // }
    Global.prototype.setConf = function (conf) {
        getConf(conf, this.conf);
    };
    // eslint-disable-next-line
    Global.prototype.paramMerge = function (req, param) {
        // eslint-disable-next-line
        console.log("no isFormData Fn");
    };
    // eslint-disable-next-line
    Global.prototype.fetchExecute = function (course, ajax) {
        // eslint-disable-next-line
        console.log("no fetchExecute Fn");
    };
    return Global;
}(event_1.default));
exports.Global = Global;
exports.ajaxGlobal = new Global();
// 统一设置参数
function getConf(_a, val) {
    var _b = _a === void 0 ? {} : _a, baseURL = _b.baseURL, paths = _b.paths, useFetch = _b.useFetch, url = _b.url, method = _b.method, dataType = _b.dataType, resType = _b.resType, _c = _b.param, param = _c === void 0 ? {} : _c, _d = _b.header, header = _d === void 0 ? {} : _d, jsonpKey = _b.jsonpKey, cache = _b.cache, withCredentials = _b.withCredentials;
    if (val === void 0) { val = {}; }
    if (baseURL) {
        val.baseURL = baseURL;
    }
    if (paths) {
        val.paths = paths;
    }
    if (typeof useFetch == "boolean") {
        val.useFetch = useFetch;
    }
    if (url) {
        // url  ==> req
        val.url = url;
    }
    if (method) {
        // 方法 ==> req
        val.method = method.toUpperCase();
    }
    if (param) {
        // 参数  ==> req
        val.param = param;
    }
    if (header) {
        // 请求头设置 ==> req
        val.header = header;
    }
    if (dataType) {
        // 缓存 get ==> req
        val.dataType = dataType;
    }
    if (resType) {
        // 返回数据类型
        val.resType = resType;
    }
    if (jsonpKey) {
        val.jsonpKey = jsonpKey;
    }
    if (typeof cache == "boolean") {
        val.cache = cache;
    }
    if (typeof withCredentials == "boolean") {
        val.withCredentials = withCredentials;
    }
    return val;
}
// 中止
function ajaxAbort(target, flag) {
    if (flag === void 0) { flag = false; }
    var course = target._course;
    if (course) {
        var req = course.req;
        // 设置outFlag，会中止回调函数的回调
        req.outFlag = true;
        if (req.xhr) {
            // xhr 可以原声支持 中止
            req.xhr.abort();
            req.xhr = undefined;
        }
        else if (req.nodeReq) {
            // node 中止
            req.nodeReq.abort();
            req.nodeReq = undefined;
        }
        delete target._course;
        flag && target.emit("abort", course);
    }
}
// 发送数据整理
function requestSend(param, course) {
    var req = course.req;
    // console.log("xxxx", param, req);
    if (req.outFlag) {
        // 已经中止
        return;
    }
    // 方法
    req.method = String(req.method || "get").toUpperCase();
    // 之前发出
    this.emit("before", course);
    req.path = "";
    req.orginURL = req.url || "";
    // let paths = req.paths || {}
    // 短路径替换
    req.formatURL = req.orginURL
        // 自定义req属性
        .replace(/^<([\w,:]*)>/, function (s0, s1) {
        s1.split(/,+/).forEach(function (key) {
            var _a = key.toLowerCase().split(/:+/), k1 = _a[0], k2 = _a[1];
            if (k2 === undefined) {
                k2 = k1;
                k1 = "method";
            }
            req[k1] = k2;
        });
        return "";
    })
        // 短路经
        .replace(/^(\w+):(?!\/\/)/, function (s0, s1) {
        req.path = s1;
        return (req.paths[s1] || s0);
    });
    var httpReg = new RegExp("^(:?http(:?s)?:)?//", "i");
    if (req.baseURL && !httpReg.test(req.url)) {
        // 有baseURL 并且不是全量地址
        req.formatURL = req.baseURL + req.formatURL;
    }
    // 确认短路径后
    this.emit("path", course);
    var method = req.method = String(req.method || "get").toUpperCase();
    exports.ajaxGlobal.paramMerge(req, param);
    // 是否为 FormData
    var isFormData = req.isFormData;
    // 请求类型
    var dataType = (req.dataType = String(req.dataType || "").toLowerCase());
    // 数据整理完成
    this.emit("open", course);
    // 还原,防止复写， 防止在 open中重写这些参数
    req.isFormData = isFormData;
    req.dataType = dataType;
    req.method = method;
    if (method == "GET") {
        var para = req.param;
        if (para && req.cache === false && !para._r_) {
            // 加随机数，去缓存
            para._r_ = sole_1.default();
        }
    }
    req.url = req.formatURL;
    exports.ajaxGlobal.fetchExecute(course, this);
}
// 结束 统一处理返回的数据
function responseEnd(course) {
    var req = course.req, res = course.res;
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
        // console.log("this.parent", this)
        this.parent.setDate(date);
    }
    delete this._course;
    // 出发验证事件
    this.emit("verify", course);
    if (res.cancel === true) {
        // 验证事件中设置 res.cancel 为false，中断处理
        return;
    }
    // callback事件，可以看做函数回调
    this.emit("callback", course);
}
exports.responseEnd = responseEnd;
//# sourceMappingURL=lib.js.map