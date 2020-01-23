"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var qs_1 = require("../qs");
var each_1 = require("../each");
var event_1 = require("../event");
var sole_1 = require("../sole");
var assign_1 = require("../assign");
// 当前host
var host = window.location.host;
// 是否原声支持 fetch
var hasFetch = !!window.fetch;
// ========================================================================= 动态加载js
// jsonp 加载方式需要使用
var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
function loadJS(url, callback) {
    // 创建节点
    var node = document.createElement("script");
    // 设置属性
    node.setAttribute("type", "text/javascript");
    node.onload = node.onerror = function () {
        node.onload = node.onerror = null;
        callback && callback();
        setTimeout(function () {
            //防止回调的时候，script还没执行完毕
            // 延时 2s 删除节点
            if (node) {
                node.parentNode.removeChild(node);
                node = null;
            }
        }, 2000);
    };
    node.async = true;
    head.appendChild(node);
    node.src = url;
    return node;
}
// ===================================================================== 获得url的真实地址
// 判断请求是否为跨域使用
var linkA = document.createElement("a");
function getFullUrl(url) {
    linkA.setAttribute("href", url);
    return linkA.href;
}
// ===================================================================== 安全获取子对象数据
function getSafeData(data, property) {
    if (property && data) {
        property.split(".").forEach(function (item) {
            data = data[item];
            if (data == null) {
                return false;
            }
        });
    }
    return data;
}
// ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
function fixedURL(url, paramStr) {
    if (paramStr) {
        return url + (url.indexOf("?") > -1 ? "&" : "?") + paramStr;
    }
    return url;
}
// ===================================================================== 参数转为 字符串
function getParamString(param, dataType) {
    if (!param) {
        return "";
    }
    if (param instanceof window.FormData) {
        return param;
    }
    if (typeof param == "string") {
        return param || "";
    }
    var str = dataType == "json" ? JSON.stringify(param) : qs_1.default.stringify(param);
    return str;
}
// ===================================================================== 获取默认的 Content-Type 的值
function getDefaultContentType(dataType) {
    if (dataType == "json") {
        return "application/json";
    }
    return "application/x-www-form-urlencoded";
}
// ==================================================================== 资源返回类
var Req = /** @class */ (function () {
    function Req() {
    }
    return Req;
}());
var Res = /** @class */ (function () {
    function Res() {
        this.jsonKey = "json";
        this.headers = "";
    }
    Res.prototype.getDate = function () {
        var parent = this.parent.parent;
        return parent.getDate();
    };
    Res.prototype.getData = function (prot, data) {
        if (data === undefined) {
            data = this[this.jsonKey];
        }
        return getSafeData(data, prot);
    };
    Res.prototype.getHeader = function (key) {
        if (typeof this.headers == "string") {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.headers) ? RegExp["$1"] : "";
        }
        if (this.headers instanceof Headers) {
            return this.headers.get(key);
        }
        return "";
    };
    return Res;
}());
var Ajax = /** @class */ (function (_super) {
    __extends(Ajax, _super);
    function Ajax(parent, opt) {
        var _this = _super.call(this, parent) || this;
        _this.conf = assign_1.merge({}, exports.theGlobal.conf, parent.conf, getConf(opt));
        return _this;
    }
    // 设置参数
    Ajax.prototype.setConf = function (opt) {
        if (opt === void 0) { opt = {}; }
        getConf(opt, this.conf);
        return this;
    };
    // 扩展
    Ajax.prototype.assign = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (typeof args[0] === "string") {
            this.assign((_a = {}, _a[args[0]] = args[1], _a));
        }
        else {
            args.unshift(this);
            assign_1.merge.apply(Object, args);
        }
        return this;
    };
    // 中止 请求
    Ajax.prototype.abort = function () {
        ajaxAbort.call(this, true);
        return this;
    };
    // 超时
    Ajax.prototype.timeout = function (time, callback) {
        var _this = this;
        setTimeout(function () {
            var req = _this._req;
            if (req) {
                // 超时 设置中止
                ajaxAbort.call(_this);
                // 出发超时事件
                _this.emit("timeout", req);
            }
        }, time);
        callback && this.on("timeout", callback);
        return this;
    };
    // 发送数据， over 代表 是否要覆盖本次请求
    Ajax.prototype.send = function (param, over) {
        var _this = this;
        if (over === void 0) { over = false; }
        if (this._req) {
            // 存在 _req
            if (!over) {
                // 不覆盖，取消本次发送
                return this;
            }
            // 中止当前的
            this.abort();
        }
        // 制造 req
        var req = new Req();
        req.parent = this;
        this._req = req;
        // 异步，settime 部分参数可以后置设置生效
        setTimeout(function () {
            assign_1.merge(req, _this.conf);
            requestSend.call(_this, param || {}, req);
        }, 1);
        return this;
    };
    // 返回Promist
    Ajax.prototype.then = function (thenFn) {
        var _this = this;
        var pse = new Promise(function (resolve, reject) {
            _this.on("callback", function (res) {
                resolve(res);
            });
            _this.on("timeout", function () {
                reject({ err: "访问超时", errType: 1 });
            });
            _this.on("abort", function () {
                reject({ err: "访问中止", errType: 2 });
            });
        });
        return (thenFn && pse.then(thenFn)) || pse;
    };
    return Ajax;
}(event_1.default));
function groupLoad(url, callback, param, onNew) {
    var opt = typeof url == "string" ? { url: url } : url;
    if (callback && typeof callback != "function") {
        param = callback;
        callback = null;
    }
    var one = new Ajax(this, opt);
    onNew && onNew(one);
    if (typeof callback == "function") {
        one.on("callback", callback);
    }
    one.send(param);
    return one;
}
var ajaxDateDiff = 0;
var Group = /** @class */ (function (_super) {
    __extends(Group, _super);
    function Group(opt) {
        var _this = _super.call(this, exports.theGlobal) || this;
        _this.dateDiff = ajaxDateDiff;
        _this.conf = {};
        opt && _this.setConf(opt);
        return _this;
    }
    Group.create = function (key, opt) {
        if (key === void 0) { key = "load"; }
        var group = new Group(opt);
        function fn() {
            return group[key].apply(group, arguments);
        }
        Object.setPrototypeOf(fn, group);
        return fn;
    };
    // 设置默认
    Group.prototype.setConf = function (opt) {
        opt && getConf(opt, this.conf);
        return this;
    };
    // 创建一个ajax
    Group.prototype.create = function (opt) {
        return new Ajax(this, opt);
    };
    // 快捷函数
    Group.prototype.shortcut = function (opt, events) {
        var _this = this;
        return function (callback, param) {
            return groupLoad.call(_this, opt, callback, param, function (one) {
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
    Group.prototype.load = function () {
        return groupLoad.apply(this, arguments);
    };
    Group.prototype.get = function () {
        return groupLoad.apply(this, arguments).setConf({ method: "get" });
    };
    Group.prototype.post = function () {
        return groupLoad.apply(this, arguments).setConf({ method: "post" });
    };
    Group.prototype.put = function () {
        return groupLoad.apply(this, arguments).setConf({ method: "put" });
    };
    Group.prototype.jsonp = function () {
        return groupLoad.apply(this, arguments).setConf({ method: "jsonp" });
    };
    // promise
    Group.prototype.fetch = function (opt, param) {
        return this.create(opt)
            .send(param)
            .then();
    };
    Group.prototype.setDate = function (date) {
        if (typeof date == "string") {
            date = new Date(date.replace(/T/, " ").replace(/\.\d+$/, ""));
        }
        this.dateDiff = ajaxDateDiff = date.getTime() - new Date().getTime();
    };
    // 获取 服务器时间
    Group.prototype.getDate = function () {
        return new Date(this.dateDiff + new Date().getTime());
    };
    return Group;
}(event_1.default));
exports.Request = Group;
var Global = /** @class */ (function (_super) {
    __extends(Global, _super);
    function Global() {
        var _this = _super.call(this) || this;
        _this.conf = { useFetch: true, resType: "json", jsonpKey: "callback", cache: true };
        return _this;
    }
    Global.prototype.setConf = function (conf) {
        getConf(conf, this.conf);
    };
    return Global;
}(event_1.default));
exports.theGlobal = new Global();
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
// 结束 统一处理返回的数据
function responseEnd(res) {
    var req = res.withReq;
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
        var group = this.parent;
        group.setDate(date);
    }
    delete this._req;
    // 出发验证事件
    this.emit("verify", res);
    if (res.cancel === true) {
        // 验证事件中设置 res.cancel 为false，中断处理
        return;
    }
    // callback事件，可以看做函数回调
    this.emit("callback", res);
}
// ============================================== jsonp
function jsonpSend(res) {
    var _this = this;
    // req
    var req = res.withReq;
    // 参数
    var param = req.param;
    // callback
    var key = req.jsonpKey;
    // jsonp回调字符串
    var backFunKey = param[key];
    if (!backFunKey) {
        // 没设置，自动设置一个
        param[key] = backFunKey = "jsonp_" + sole_1.default();
    }
    // 控制，只出发一次回调
    var backFunFlag;
    // 回调函数
    var backFun = function (data) {
        if (!backFunFlag) {
            backFunFlag = true;
            // json数据
            res.json = data;
            // json字符串
            res.text = "";
            // 错误，有data就正确的
            res.err = data ? null : "http error";
            if (!req.outFlag) {
                // outFlag 就中止
                responseEnd.call(_this, res);
            }
        }
    };
    // 设置默认的回调函数
    var w = window;
    w[backFunKey] = backFun;
    // 所有参数都放在url上
    var url = fixedURL(req.url, getParamString(param, req.dataType));
    // 发送事件出发
    this.emit("send", req);
    // 发送请求
    loadJS(url, function () {
        backFun();
    });
}
/**
 * fetch 发送数据
 */
function fetchSend(res) {
    var _this = this;
    var req = res.withReq;
    // 方法
    var method = String(req.method || "GET").toUpperCase();
    // 参数
    var param = req.param;
    // fetch option参数
    var option = {
        method: method,
        headers: req.header
    };
    // 提交字符串
    var paramStr = getParamString(param, req.dataType);
    if (method == "GET") {
        req.url = fixedURL(req.url, paramStr);
        option.body = param = null;
    }
    else {
        option.body = paramStr || null;
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // 默认 Content-Type
            req.header["Content-Type"] = getDefaultContentType(req.dataType);
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With
        req.header["X-Requested-With"] = "XMLHttpRequest";
    }
    if (req.isCross) {
        // 跨域
        option.mode = "cors";
        if (req.withCredentials) {
            // 发送请求，带上cookie
            option.credentials = "include";
        }
    }
    else {
        // 同域，默认带上cookie
        option.credentials = "same-origin";
    }
    // response.text then回调函数
    var fetchData = function (_a) {
        var text = _a[0], result = _a[1];
        res.text = text;
        res.result = result;
        // 统一处理 返回数据
        responseEnd.call(_this, res);
    };
    // fetch then回调函数
    function fetchBack(response) {
        if (!req.outFlag) {
            // outFlag 为true，表示 中止了
            // 设置 headers 方便获取
            res.headers = response.headers;
            // 状态吗
            res.status = response.status;
            // 返回的字符串
            res.text = "";
            // 是否有错误
            res.err = response.ok ? null : "http error [" + res.status + "]";
            var results = ["", null];
            try {
                results[0] = response.text();
            }
            catch (e) { }
            if (["json", "text"].indexOf(req.resType) < 0) {
                try {
                    results[1] = response[req.resType]();
                }
                catch (e) { }
            }
            Promise.all(results).then(fetchData, fetchData);
        }
        delete req.outFlag;
    }
    // 发送事件处理
    this.emit("send", req);
    // 发送数据
    window.fetch(req.url, option).then(fetchBack, fetchBack);
}
// ===================================================================xhr 发送数据
// xhr的onload事件
function onload(res) {
    var req = res.withReq;
    var xhr = req.xhr;
    if (xhr && !req.outFlag) {
        // req.outFlag 为true 表示，本次ajax已经中止，无需处理
        try {
            // 获取所有可以的的header值（字符串）
            res.headers = xhr.getAllResponseHeaders();
        }
        catch (e) { }
        res.text = "";
        try {
            // 返回的文本信息
            res.text = xhr.responseText;
        }
        catch (e) { }
        res.result = null;
        try {
            // 返回的文本信息
            res.result = xhr.response;
        }
        catch (e) { }
        // 默认状态值为 0
        res.status = 0;
        try {
            // xhr status
            res.status = xhr.status;
        }
        catch (e) { }
        // if(res.status === 0){
        //     res.status = res.text ? 200 : 404;
        // }
        var s = res.status;
        // 默认只有当 正确的status才是 null， 否则是错误
        res.err = (s >= 200 && s < 300) || s === 304 || s === 1223 ? null : "http error [" + s + "]";
        // 统一后处理
        responseEnd.call(this, res);
    }
    delete req.xhr;
    delete req.outFlag;
}
/**
 * xhr 发送数据
 * @returns {ajax}
 */
function xhrSend(res) {
    var _this = this;
    var req = res.withReq;
    // XHR
    req.xhr = new window.XMLHttpRequest();
    // xhr 请求方法
    var method = String(req.method || "GET").toUpperCase();
    if (req.withCredentials) {
        // xhr 跨域带cookie
        req.xhr.withCredentials = true;
    }
    var paramStr = getParamString(req.param, req.dataType);
    if (method == "GET") {
        // get 方法，参数都组合到 url上面
        req.xhr.open(method, fixedURL(req.url, paramStr), true);
        paramStr = null;
    }
    else {
        req.xhr.open(method, req.url, true);
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // Content-Type 默认值
            req.header["Content-Type"] = getDefaultContentType(req.dataType);
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With 如果增加，容易出现问题，需要可以通过 事件设置
        req.header["X-Requested-With"] = "XMLHttpRequest";
    }
    // XDR 不能设置 header
    each_1.default(req.header, function (v, k) {
        req.xhr.setRequestHeader(k, v);
    });
    res.status = 0;
    if (this.hasEvent("progress")) {
        // 跨域 加上 progress post请求导致 多发送一个 options 的请求
        // 只有有进度需求的任务,才加上
        try {
            req.xhr.upload.onprogress = function () {
                _this.emit("progress", event);
            };
        }
        catch (e) { }
    }
    //发送请求
    // onload事件
    req.xhr.onload = onload.bind(this, res);
    // 发送前出发send事件
    this.emit("send", req);
    if (["arraybuffer", "blob"].indexOf(req.resType) >= 0) {
        req.xhr.responseType = req.resType;
    }
    // 发送请求，注意要替换
    if (typeof paramStr == "string") {
        // eslint-disable-next-line
        paramStr = paramStr.replace(/[\x00-\x08\x11-\x12\x14-\x20]/g, "*");
    }
    req.xhr.send(paramStr);
}
// 发送数据整理
function requestSend(param, req) {
    // console.log("xxxx", param, req);
    if (req.outFlag) {
        // 已经中止
        return;
    }
    // 方法
    req.method = String(req.method || "get").toUpperCase();
    // callback中接收的 res
    var res = new Res();
    res.withReq = req;
    res.parent = this;
    // 之前发出
    this.emit("before", req);
    req.path = "";
    req.orginURL = req.url;
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
        req.path = s0;
        return req.paths[s1] || s0;
    });
    if (req.baseURL && !/^(:?http(:?s)?:)?\/\//i.test(req.url)) {
        // 有baseURL 并且不是全量地址
        req.formatURL = req.baseURL + req.formatURL;
    }
    // 确认短路径后
    this.emit("path", req);
    // 是否为 FormData
    var isFormData = false;
    if (window.FormData && param instanceof window.FormData) {
        isFormData = true;
    }
    req.isFormData = isFormData;
    // 请求类型
    var dataType = (req.dataType = String(req.dataType || "").toLowerCase());
    if (isFormData) {
        // FormData 将参数都添加到 FormData中
        each_1.default(req.param, function (value, key) {
            ;
            param.append(key, value);
        });
        req.param = param;
    }
    else {
        if (typeof param == "string") {
            // 参数为字符串，自动格式化为 object，后面合并后在序列化
            param = dataType == "json" ? JSON.parse(param) : qs_1.default.parse(param);
        }
        assign_1.merge(req.param, param || {});
    }
    // 数据整理完成
    this.emit("open", req);
    // 还原,防止复写， 防止在 open中重写这些参数
    req.isFormData = isFormData;
    req.dataType = dataType;
    var method = String(req.method || "get").toUpperCase();
    if (method == "GET") {
        var para = req.param;
        if (para && req.cache === false && !para._r_) {
            // 加随机数，去缓存
            para._r_ = sole_1.default();
        }
    }
    // 是否跨域, 获全路径后，比对
    req.isCross = !/:\/\/$/.test(getFullUrl(req.formatURL).split(host)[0] || "");
    req.url = req.formatURL;
    if (method == "JSONP") {
        // jsonp 获取数据
        jsonpSend.call(this, res);
        return;
    }
    if (hasFetch && req.useFetch && !this.hasEvent("progress")) {
        //fetch 存在 fetch 并且无上传或者进度回调 只能异步
        fetchSend.call(this, res);
        return;
    }
    // 走 XMLHttpRequest
    xhrSend.call(this, res);
}
// 中止
function ajaxAbort(flag) {
    var req = this._req;
    if (req) {
        // 设置outFlag，会中止回调函数的回调
        req.outFlag = true;
        if (req.xhr) {
            // xhr 可以原声支持 中止
            req.xhr.abort();
            req.xhr = null;
        }
        delete this._req;
        flag && this.emit("abort", req);
    }
}
var def = Group.create("load");
// 全局
def.global = exports.theGlobal;
// 分组类
def.Request = Group;
exports.default = def;
//# sourceMappingURL=index.js.map