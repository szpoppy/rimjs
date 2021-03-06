"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
var node_fetch_1 = require("node-fetch");
var FormData = require("form-data");
// 实现具体的请求
lib_1.ajaxGlobal.isFormData = function (para) {
    return para instanceof FormData;
};
lib_1.ajaxGlobal.fetchExecute = function (course, ajax) {
    var req = course.req;
    req.isCross = false;
    nodeFetchSend.call(ajax, course);
};
// fetch 发送数据
function nodeFetchSend(course) {
    var _this = this;
    var req = course.req, res = course.res;
    // 方法
    var method = req.method;
    // 参数
    var param = req.param;
    // fetch option参数
    var option = {
        method: method,
        headers: req.header
    };
    // 提交字符串
    var paramStr = req.isFormData ? param : lib_1.getParamString(param, req.dataType);
    if (method == "GET") {
        req.url = lib_1.fixedURL(req.url, paramStr);
        option.body = null;
        param = undefined;
    }
    else {
        option.body = paramStr || null;
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // 默认 Content-Type
            req.header["Content-Type"] = lib_1.getDefaultContentType(req.dataType);
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With
        req.header["X-Requested-With"] = "XMLHttpRequest";
    }
    // response.text then回调函数
    var fetchData = function (data) {
        res.text = data[0];
        res.result = data[1] || {};
        // 统一处理 返回数据
        lib_1.responseEnd.call(_this, course);
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
    }
    // 发送事件处理
    this.emit("send", course);
    // 发送数据
    node_fetch_1.default(req.url, option).then(fetchBack, fetchBack);
}
//# sourceMappingURL=node.js.map