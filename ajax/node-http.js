"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
var http_1 = require("http");
var https_1 = require("https");
// import forEach from "../each"
var assign_1 = require("../assign");
var qs = require("querystring");
// import { ReadStream, createReadStream } from "fs"
// 实现具体的请求
// ajaxGlobal.isFormData = function(param, req) {
//     return req.dataType == "form-data"
// }
lib_1.ajaxGlobal.paramMerge = function (req, param) {
    // 不支持 formData
    req.isFormData = false;
    if (typeof param == "string") {
        // 参数为字符串，自动格式化为 object，后面合并后在序列化
        param = req.dataType != "json" || req.method == "GET" ? qs.parse(param) : JSON.parse(param);
    }
    assign_1.merge(req.param, param || {});
    // let isFormData = param instanceof NodeFormData
    // if (isFormData) {
    //     // FormData 将参数都添加到 FormData中
    //     forEach(req.param, function(value, key) {
    //         let fd = <NodeFormData>param
    //         fd.set(key as string, value)
    //     })
    //     req.param = param
    // } else {
    //     if (typeof param == "string") {
    //         // 参数为字符串，自动格式化为 object，后面合并后在序列化
    //         param = req.dataType == "json" ? JSON.parse(param) : qs.parse(param)
    //     }
    //     merge(req.param, param || {})
    // }
};
lib_1.ajaxGlobal.fetchExecute = function (course, ajax) {
    var req = course.req;
    req.isCross = false;
    httpRequest.call(ajax, course);
};
// boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
// fetch 发送数据
function httpRequest(course) {
    var _this = this;
    var req = course.req, res = course.res;
    var isHttps = /^https:/.test(req.url);
    // 方法
    var method = req.method;
    // 参数
    var param = req.param;
    // fetch option参数
    var option = {
        method: method,
        headers: req.header
    };
    var isGet = method == "GET";
    // let boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    if (isGet) {
        req.url = lib_1.fixedURL(req.url, lib_1.getParamString(param));
    }
    else {
        if (req.header["Content-Type"] === undefined) {
            // 默认 Content-Type
            // req.header["Content-Type"] = req.isFormData ? "multipart/form-data; boundary=" + boundary : getDefaultContentType(req.dataType)
            req.header["Content-Type"] = lib_1.getDefaultContentType(req.dataType);
        }
        if (req.header["X-Requested-With"] === undefined) {
            // 跨域不增加 X-Requested-With
            req.header["X-Requested-With"] = "XMLHttpRequest";
        }
    }
    var reqSend = isHttps ? https_1.request : http_1.request;
    function httpError(e) {
        if (!req.outFlag) {
            res.err = e.message;
        }
        // req.outFlag = false
        // 统一处理 返回数据
        lib_1.responseEnd.call(this, course);
    }
    var client = reqSend(req.url, option, function (cRes) {
        cRes.setEncoding("utf8");
        var chunks = [];
        cRes.on("data", function (chunk) {
            chunks.push(chunk);
        });
        cRes.on("error", httpError);
        cRes.on("end", function () {
            if (!req.outFlag) {
                // 状态吗
                var s = cRes.statusCode;
                res.status = s;
                // 设置 headers 方便获取
                res.headers = cRes.headers;
                // 是否有错误
                res.err = (s >= 200 && s < 300) || s === 304 ? null : "http error [" + s + "]";
                try {
                    res.text = Buffer.isBuffer(chunks[0]) ? Buffer.concat(chunks).toString() : chunks.join("");
                }
                catch (e) { }
                // 统一处理 返回数据
                lib_1.responseEnd.call(_this, course);
            }
            // req.outFlag = false
        });
    });
    req.nodeReq = client;
    client.on("error", httpError);
    if (isGet) {
        client.end();
        return;
    }
    if (!req.isFormData) {
        client.write(lib_1.getParamString(req.param, req.dataType), "utf-8");
        client.end();
        return;
    }
    // // 模拟表单
    // interface upArrItem {
    //     name: string
    //     buffer?: Buffer
    //     readStream?: ReadStream
    //     fileName?: string
    // }
    // let upArr: upArrItem[] = []
    // ;(<NodeFormData>param).forEach(function(item, key) {
    //     if (Buffer.isBuffer(item) || item instanceof ReadStream || typeof item == "string") {
    //         item = { value: item, name: key }
    //     }
    //     let it: upArrItem = {
    //         name: item.name || key
    //     }
    //     if (Buffer.isBuffer(item.value)) {
    //         it.buffer = item.value
    //     } else if (item.value instanceof ReadStream) {
    //         it.readStream = item.value
    //     } else if (item.url) {
    //         it.readStream = createReadStream(item.url)
    //     } else if (typeof item.value == "string") {
    //         it.buffer = Buffer.from(item.value, "utf-8")
    //     }
    //     if (it.buffer || it.readStream) {
    //         if (item.fileName) {
    //             it.fileName = item.fileName
    //         }
    //         upArr.push(it)
    //     }
    // })
    // // 上传
    // function next() {
    //     if (!upArr.length) {
    //         client.end(`\r\n--${boundary}--`)
    //         return
    //     }
    //     let item = upArr.shift()
    //     client.write(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="${item.name}"${item.fileName ? '; filename="' + item.fileName + '"' : ""}\r\n\r\n`)
    //     if (item.buffer) {
    //         client.write(item.buffer)
    //         next()
    //         return
    //     }
    //     if (item.readStream) {
    //         item.readStream.pipe(client, { end: false })
    //         item.readStream.on("end", () => {
    //             next()
    //         })
    //         item.readStream.on("error", httpError)
    //         return
    //     }
    //     next()
    // }
    // next()
}
//# sourceMappingURL=node-http.js.map