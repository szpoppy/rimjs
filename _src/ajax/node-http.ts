import { Ajax, AjaxCourse, ajaxGlobal, getParamString, fixedURL, getDefaultContentType, responseEnd } from "./lib"
import { request as httpSend } from "http"
import { request as httpsSend, RequestOptions as httpsOptions } from "https"
// import forEach from "../each"
import { merge } from "../assign"
import * as qs from "querystring"
// import { ReadStream, createReadStream } from "fs"

// 实现具体的请求
// ajaxGlobal.isFormData = function(param, req) {
//     return req.dataType == "form-data"
// }

ajaxGlobal.paramMerge = function(req, param) {
    // 不支持 formData
    req.isFormData = false
    if (typeof param == "string") {
        // 参数为字符串，自动格式化为 object，后面合并后在序列化
        param = req.dataType != "json" || req.method == "GET" ? qs.parse(param) : JSON.parse(param)
    }
    merge(req.param, param || {})

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
}

ajaxGlobal.fetchExecute = function(course, ajax) {
    let { req } = course
    req.isCross = false
    httpRequest.call(ajax, course)
}

// boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

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
        headers: req.header
    }

    let isGet = method == "GET"
    // let boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    if (isGet) {
        req.url = fixedURL(req.url, getParamString(param) as string)
    } else {
        if (req.header["Content-Type"] === undefined) {
            // 默认 Content-Type
            // req.header["Content-Type"] = req.isFormData ? "multipart/form-data; boundary=" + boundary : getDefaultContentType(req.dataType)
            req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
        if (req.header["X-Requested-With"] === undefined) {
            // 跨域不增加 X-Requested-With
            req.header["X-Requested-With"] = "XMLHttpRequest"
        }
    }
    let reqSend = isHttps ? httpsSend : httpSend
    function httpError(e: Error) {
        if (!req.outFlag) {
            res.err = e.message
        }
        // req.outFlag = false

        // 统一处理 返回数据
        responseEnd.call(this, course)
    }
    let client = reqSend(req.url, option, cRes => {
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
                    res.text = chunks.join("")
                } catch (e) {}

                // 统一处理 返回数据
                responseEnd.call(this, course)
            }
            // req.outFlag = false
        })
    })
    req.nodeReq = client
    client.on("error", httpError)

    if (isGet) {
        client.end()
        return
    }

    if (!req.isFormData) {
        client.write(getParamString(req.param, req.dataType), "utf-8")
        client.end()
        return
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
