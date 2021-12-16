"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
var sole_1 = require("../sole");
var getFullUrl_1 = require("../util/getFullUrl");
var loadJS_1 = require("../util/loadJS");
var each_1 = require("../each");
// 实现具体的请求
lib_1.ajaxGlobal.isFormData = function (para) {
    return window.FormData && para instanceof window.FormData;
};
lib_1.ajaxGlobal.fetchExecute = function (course, ajax) {
    var req = course.req;
    // 是否跨域, 获全路径后，比对
    req.isCross = !/:\/\/$/.test(getFullUrl_1.getFullUrl(req.formatURL).split(host)[0] || "");
    if (req.method == "JSONP") {
        // jsonp 获取数据
        jsonpSend.call(ajax, course);
        return;
    }
    if (hasFetch && req.useFetch && !ajax.hasEvent("progress")) {
        //fetch 存在 fetch 并且无上传或者进度回调 只能异步
        fetchSend.call(ajax, course);
        return;
    }
    // // 走 XMLHttpRequest
    xhrSend.call(ajax, course);
};
// 当前host
var host = window.location.host;
// 是否原声支持 fetch
var hasFetch = !!window.fetch;
// ============================================== jsonp
function jsonpSend(course) {
    var _this = this;
    // req
    var req = course.req, res = course.res;
    // 参数
    var param = req.param || {};
    // callback
    var key = req.jsonpKey;
    // jsonp回调字符串
    var backFunKey = param[key] || "";
    if (!backFunKey) {
        // 没设置，自动设置一个
        param[key] = backFunKey = "jsonp_" + sole_1.default();
    }
    // 控制，只出发一次回调
    var backFunFlag = false;
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
                lib_1.responseEnd.call(_this, course);
            }
        }
    };
    // 设置默认的回调函数
    var w = window;
    w[backFunKey] = backFun;
    // 所有参数都放在url上
    var url = lib_1.fixedURL(req.url, lib_1.getParamString(param));
    // 发送事件出发
    this.emit("send", course);
    // 发送请求
    loadJS_1.loadJS(url, function () {
        backFun();
    });
}
/**
 * fetch 发送数据
 */
function fetchSend(course) {
    var _this = this;
    var req = course.req, res = course.res;
    // 方法
    var method = String(req.method || "GET").toUpperCase();
    // 参数
    var param = req.param;
    // fetch option参数
    var option = {
        method: method,
        headers: req.header
    };
    if (method == "GET") {
        req.url = lib_1.fixedURL(req.url, lib_1.getParamString(param));
        option.body = null;
        param = undefined;
    }
    else {
        option.body = (req.isFormData ? param : lib_1.getParamString(param, req.dataType)) || null;
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // 默认 Content-Type
            req.header["Content-Type"] = lib_1.getDefaultContentType(req.dataType);
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With
        req.header["X-Requested-With"] = "XMLHttpRequest";
    }
    if (req.isCross) {
        // 跨域
        option.mode = "cors";
    }
    // 同域，默认带上cookie
    option.credentials = "same-origin";
    if (req.withCredentials && req.isCross) {
        // 发送请求，带上cookie 跨域
        option.credentials = "include";
    }
    // response.text then回调函数
    var fetchData = function (data) {
        res.text = data[0];
        res.result = data[1] || {};
        // 统一处理 返回数据
        lib_1.responseEnd.call(_this, course);
    };
    // 发送事件处理
    this.emit("send", course);
    // 发送数据
    window.fetch(req.url, option).then(function (response) {
        if (!req.outFlag) {
            // outFlag 为true，表示 中止了
            // 设置 headers 方便获取
            res.headers = response.headers || "";
            // 状态吗
            res.status = response.status || 0;
            // 返回的字符串
            res.text = "";
            // 是否有错误
            res.err = response.ok ? null : "http error [" + res.status + "]";
            var results = [];
            try {
                results[0] = response.text();
            }
            catch (e) { }
            if (req.resType != "text" && req.resType != "json") {
                // 只是为了不报错
                results[1] = response[req.resType]();
            }
            Promise.all(results).then(fetchData, fetchData);
        }
        req.outFlag = false;
    }, function (err) {
        if (!req.outFlag) {
            // outFlag 为true，表示 中止了
            // 设置 headers 方便获取
            res.headers = "";
            // 状态吗
            res.status = -1;
            // 是否有错误
            res.err = err.message;
            fetchData(["", {}]);
        }
        req.outFlag = false;
    });
}
// ===================================================================xhr 发送数据
// xhr的onload事件
function onload(course) {
    var req = course.req, res = course.res;
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
        lib_1.responseEnd.call(this, course);
    }
    delete req.xhr;
    req.outFlag = false;
}
/**
 * xhr 发送数据
 * @returns {ajax}
 */
function xhrSend(course) {
    var _this = this;
    var res = course.res, req = course.req;
    // XHR
    req.xhr = new XMLHttpRequest();
    // xhr 请求方法
    var method = String(req.method || "GET").toUpperCase();
    if (req.withCredentials) {
        // xhr 跨域带cookie
        req.xhr.withCredentials = true;
    }
    var paramStr = null;
    if (method == "GET") {
        // get 方法，参数都组合到 url上面
        req.xhr.open(method, lib_1.fixedURL(req.url, lib_1.getParamString(req.param)), true);
    }
    else {
        req.xhr.open(method, req.url, true);
        paramStr = req.isFormData ? req.param : lib_1.getParamString(req.param, req.dataType);
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // Content-Type 默认值
            req.header["Content-Type"] = lib_1.getDefaultContentType(req.dataType);
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With 如果增加，容易出现问题，需要可以通过 事件设置
        req.header["X-Requested-With"] = "XMLHttpRequest";
    }
    // XDR 不能设置 header
    each_1.default(req.header, function (v, k) {
        var xhr = req.xhr;
        xhr.setRequestHeader(k, v);
    });
    res.status = 0;
    if (this.hasEvent("progress")) {
        // 跨域 加上 progress post请求导致 多发送一个 options 的请求
        // 只有有进度需求的任务,才加上
        try {
            req.xhr.upload.onprogress = function (event) {
                course.progress = event;
                _this.emit("progress", course);
            };
        }
        catch (e) { }
    }
    //发送请求
    // onload事件
    req.xhr.onload = onload.bind(this, course);
    // 发送前出发send事件
    this.emit("send", course);
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
//# sourceMappingURL=browser.js.map