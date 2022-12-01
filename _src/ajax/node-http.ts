import { Ajax, AjaxCourse, ajaxGlobal, getParamString, fixedURL, getDefaultContentType, responseEnd, NodeFormData } from "./lib"
import { request as httpSend, RequestOptions as httpsOptions } from "http"
import { request as httpsSend } from "https"
import forEach from "../each"
import { assign } from "../assign"
import qs from "../qs"
import * as path from "path"
import { ReadStream, createReadStream } from "fs"

// 实现具体的请求
// ajaxGlobal.isFormData = function(param, req) {
//     return req.dataType == "form-data"
// }

ajaxGlobal.paramMerge = function (req, param) {
    let isFormData = param instanceof NodeFormData
    req.isFormData = isFormData
    if (isFormData) {
        req.method = "POST"
        // FormData 将参数都添加到 FormData中
        forEach(req.param, function (value, key) {
            let fd = <NodeFormData>param
            fd.set(key as string, value)
        })
        req.param = param
        return
    }
    if (typeof param == "string") {
        if (req.dataType == "text") {
            req.param = param
            return
        }
        // 参数为字符串，自动格式化为 object，后面合并后在序列化
        param = req.dataType != "json" || req.method == "GET" ? qs.parse(param) : JSON.parse(param)
    }
    req.param = assign({ $: req.param }, { $: param || {} }).$
}

ajaxGlobal.fetchExecute = function (course, ajax) {
    let { req } = course
    req.isCross = false
    httpRequest.call(ajax, course)
}

// fetch 发送数据
function httpRequest(this: Ajax, course: AjaxCourse): void {
    let { req, res } = course
    let isHttps = /^https:/.test(req.url)
    // 方法
    let method = req.method

    // 参数
    let param = req.param

    // fetch option参数
    let option: httpsOptions = {
        method: method,
        headers: req.header as any
    }

    let isGet = method == "GET"
    let boundary = "----WebKitFormBoundary" + new Date().getTime().toString(36)
    if (isGet) {
        req.url = fixedURL(req.url, getParamString(param) as string)
    } else {
        if (req.header["Content-Type"] === undefined) {
            // 默认 Content-Type
            req.header["Content-Type"] = req.isFormData ? "multipart/form-data; boundary=" + boundary : getDefaultContentType(req.dataType)
            // req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
        if (req.header["X-Requested-With"] === undefined) {
            // 跨域不增加 X-Requested-With
            req.header["X-Requested-With"] = "XMLHttpRequest"
        }
    }
    let reqSend = isHttps ? httpsSend : httpSend
    let httpError = (e: Error) => {
        if (!req.outFlag) {
            res.err = e.message
            // 统一处理 返回数据
            responseEnd.call(this, course)
        }
    }

    // 发送前出发send事件
    let src = req.url
    if (!isGet) {
        req.body = req.isFormData ? param : getParamString(req.param, req.dataType)
    }

    if (req.header["Content-Length"] === undefined && method != "GET" && method != "POST" && req.body && typeof req.body == 'string') {
        req.header["Content-Length"] = Buffer.byteLength(req.body)
    }

    this.emit("send", course)

    let client = reqSend(src, option, cRes => {
        cRes.setEncoding("utf8")
        let chunks: any[] = []
        cRes.on("data", chunk => {
            chunks.push(chunk)
        })
        cRes.on("error", httpError)
        cRes.on("end", () => {
            if (!req.outFlag) {
                // 状态吗
                let s = cRes.statusCode
                res.status = s
                // 设置 headers 方便获取
                res.headers = cRes.headers
                // 是否有错误
                res.err = (s >= 200 && s < 300) || s === 304 ? null : "http error [" + s + "]"
                try {
                    res.text = Buffer.isBuffer(chunks[0]) ? Buffer.concat(chunks).toString() : chunks.join("")
                } catch (e) { }

                // 统一处理 返回数据
                responseEnd.call(this, course)
            }
        })
    })
    req.nodeReq = client
    client.on("error", httpError)

    if (isGet) {
        client.end()
        return
    }

    if (!req.isFormData) {
        client.write(req.body, "utf-8")
        client.end()
        return
    }

    let formData = req.body as NodeFormData

    // 模拟表单
    interface upArrItem {
        name: string
        buffer?: Buffer
        readStream?: ReadStream
        fileName?: string
    }
    let upArr: upArrItem[] = []
    formData.forEach(function (item, key) {
        if (Buffer.isBuffer(item) || item instanceof ReadStream || typeof item == "string") {
            item = { value: item, name: key }
        }
        let it: upArrItem = {
            name: item.name || key
        }

        if (Buffer.isBuffer(item.value)) {
            it.buffer = item.value
        } else if (item.value instanceof ReadStream) {
            it.readStream = item.value
        } else if (item.url) {
            it.readStream = createReadStream(item.url)
            if (!item.fileName) {
                item.fileName = path.basename(item.url)
            }
        } else if (typeof item.value == "string") {
            it.buffer = Buffer.from(item.value, "utf-8")
        }

        if (it.buffer || it.readStream) {
            if (item.fileName) {
                it.fileName = item.fileName
            }
            upArr.push(it)
        }
    })

    // 上传
    function next() {
        if (!upArr.length) {
            client.end(`\r\n--${boundary}--`)
            return
        }
        let item = upArr.shift()
        if (item.readStream) {
            // 流上传
            let formStr = `\r\n--${boundary}\r\n" + "Content-Type: application/octet-stream\r\nContent-Disposition: form-data; name="${item.name}"${item.fileName ? '; filename="' + item.fileName + '"' : ""}\r\nContent-@R_883_301@: binary\r\n\r\n`
            client.write(Buffer.from(formStr, "utf-8"))
            item.readStream.pipe(client, { end: false })
            item.readStream.on("end", () => {
                next()
            })
            item.readStream.on("error", httpError)
            return
        }

        if (item.buffer) {
            client.write(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="${item.name}"${item.fileName ? '; filename="' + item.fileName + '"' : ""}\r\n\r\n`)
            client.write(item.buffer)
            next()
            return
        }
        next()
    }

    next()
}
