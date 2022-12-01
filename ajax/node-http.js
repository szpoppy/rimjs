"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
var http_1 = require("http");
var https_1 = require("https");
var each_1 = __importDefault(require("../each"));
var assign_1 = require("../assign");
var qs_1 = __importDefault(require("../qs"));
var path = __importStar(require("path"));
var fs_1 = require("fs");
// 实现具体的请求
// ajaxGlobal.isFormData = function(param, req) {
//     return req.dataType == "form-data"
// }
lib_1.ajaxGlobal.paramMerge = function (req, param) {
    var isFormData = param instanceof lib_1.NodeFormData;
    req.isFormData = isFormData;
    if (isFormData) {
        req.method = "POST";
        // FormData 将参数都添加到 FormData中
        each_1.default(req.param, function (value, key) {
            var fd = param;
            fd.set(key, value);
        });
        req.param = param;
        return;
    }
    if (typeof param == "string") {
        if (req.dataType == "text") {
            req.param = param;
            return;
        }
        // 参数为字符串，自动格式化为 object，后面合并后在序列化
        param = req.dataType != "json" || req.method == "GET" ? qs_1.default.parse(param) : JSON.parse(param);
    }
    req.param = assign_1.assign({ $: req.param }, { $: param || {} }).$;
};
lib_1.ajaxGlobal.fetchExecute = function (course, ajax) {
    var req = course.req;
    req.isCross = false;
    httpRequest.call(ajax, course);
};
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
    var boundary = "----WebKitFormBoundary" + new Date().getTime().toString(36);
    if (isGet) {
        req.url = lib_1.fixedURL(req.url, lib_1.getParamString(param));
    }
    else {
        if (req.header["Content-Type"] === undefined) {
            // 默认 Content-Type
            req.header["Content-Type"] = req.isFormData ? "multipart/form-data; boundary=" + boundary : lib_1.getDefaultContentType(req.dataType);
            // req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
        if (req.header["X-Requested-With"] === undefined) {
            // 跨域不增加 X-Requested-With
            req.header["X-Requested-With"] = "XMLHttpRequest";
        }
    }
    var reqSend = isHttps ? https_1.request : http_1.request;
    var httpError = function (e) {
        if (!req.outFlag) {
            res.err = e.message;
            // 统一处理 返回数据
            lib_1.responseEnd.call(_this, course);
        }
    };
    // 发送前出发send事件
    var src = req.url;
    if (!isGet) {
        req.body = req.isFormData ? param : lib_1.getParamString(req.param, req.dataType);
    }
    if (req.header["Content-Length"] === undefined && method != "GET" && method != "POST" && req.body && typeof req.body == 'string') {
        req.header["Content-Length"] = Buffer.byteLength(req.body);
    }
    this.emit("send", course);
    var client = reqSend(src, option, function (cRes) {
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
        });
    });
    req.nodeReq = client;
    client.on("error", httpError);
    if (isGet) {
        client.end();
        return;
    }
    if (!req.isFormData) {
        client.write(req.body, "utf-8");
        client.end();
        return;
    }
    var formData = req.body;
    var upArr = [];
    formData.forEach(function (item, key) {
        if (Buffer.isBuffer(item) || item instanceof fs_1.ReadStream || typeof item == "string") {
            item = { value: item, name: key };
        }
        var it = {
            name: item.name || key
        };
        if (Buffer.isBuffer(item.value)) {
            it.buffer = item.value;
        }
        else if (item.value instanceof fs_1.ReadStream) {
            it.readStream = item.value;
        }
        else if (item.url) {
            it.readStream = fs_1.createReadStream(item.url);
            if (!item.fileName) {
                item.fileName = path.basename(item.url);
            }
        }
        else if (typeof item.value == "string") {
            it.buffer = Buffer.from(item.value, "utf-8");
        }
        if (it.buffer || it.readStream) {
            if (item.fileName) {
                it.fileName = item.fileName;
            }
            upArr.push(it);
        }
    });
    // 上传
    function next() {
        if (!upArr.length) {
            client.end("\r\n--" + boundary + "--");
            return;
        }
        var item = upArr.shift();
        if (item.readStream) {
            // 流上传
            var formStr = "\r\n--" + boundary + "\r\n\" + \"Content-Type: application/octet-stream\r\nContent-Disposition: form-data; name=\"" + item.name + "\"" + (item.fileName ? '; filename="' + item.fileName + '"' : "") + "\r\nContent-@R_883_301@: binary\r\n\r\n";
            client.write(Buffer.from(formStr, "utf-8"));
            item.readStream.pipe(client, { end: false });
            item.readStream.on("end", function () {
                next();
            });
            item.readStream.on("error", httpError);
            return;
        }
        if (item.buffer) {
            client.write("\r\n--" + boundary + "\r\nContent-Disposition: form-data; name=\"" + item.name + "\"" + (item.fileName ? '; filename="' + item.fileName + '"' : "") + "\r\n\r\n");
            client.write(item.buffer);
            next();
            return;
        }
        next();
    }
    next();
}
//# sourceMappingURL=node-http.js.map