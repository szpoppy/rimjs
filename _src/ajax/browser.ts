import { Ajax, AjaxCourse, ajaxGlobal, getParamString, fixedURL, getDefaultContentType, responseEnd } from "./lib"
import getUUID from "../sole"
import { getFullUrl } from "../util/getFullUrl"
import { loadJS } from "../util/loadJS"
import forEach from "../each"

// 实现具体的请求
ajaxGlobal.isFormData = function(para) {
    return window.FormData && para instanceof window.FormData
}
ajaxGlobal.fetchExecute = function(course, ajax) {
    let { req } = course
    // 是否跨域, 获全路径后，比对
    req.isCross = !/:\/\/$/.test(getFullUrl(req.formatURL).split(host)[0] || "")

    if (req.method == "JSONP") {
        // jsonp 获取数据
        jsonpSend.call(ajax, course)
        return
    }

    if (hasFetch && req.useFetch && !ajax.hasEvent("progress")) {
        //fetch 存在 fetch 并且无上传或者进度回调 只能异步
        fetchSend.call(ajax, course)
        return
    }

    // // 走 XMLHttpRequest
    xhrSend.call(ajax, course)
}

// 当前host
const host: string = window.location.host

// 是否原声支持 fetch
const hasFetch: boolean = !!window.fetch

// ============================================== jsonp
function jsonpSend(this: Ajax, course: AjaxCourse): void {
    // req
    let { req, res } = course

    // 参数
    let param: any = req.param || {}

    // callback
    let key = req.jsonpKey as string
    // jsonp回调字符串
    let backFunKey = param[key] || ""
    if (!backFunKey) {
        // 没设置，自动设置一个
        param[key] = backFunKey = "jsonp_" + getUUID()
    }

    // 控制，只出发一次回调
    let backFunFlag: boolean = false
    // 回调函数
    let backFun = (data?: any) => {
        if (!backFunFlag) {
            backFunFlag = true
            // json数据
            res.json = data
            // json字符串
            res.text = ""
            // 错误，有data就正确的
            res.err = data ? null : "http error"
            if (!req.outFlag) {
                // outFlag 就中止
                responseEnd.call(this, course)
            }
        }
    }

    // 设置默认的回调函数
    let w = window as any
    w[backFunKey] = backFun

    // 所有参数都放在url上
    let url = fixedURL(req.url, getParamString(param, req.dataType) as string)

    // 发送事件出发
    this.emit("send", course)
    // 发送请求
    loadJS(url, function() {
        backFun()
    })
}

/**
 * fetch 发送数据
 */
function fetchSend(this: Ajax, course: AjaxCourse): void {
    let { req, res } = course
    // 方法
    let method = String(req.method || "GET").toUpperCase()

    // 参数
    let param = req.param

    // fetch option参数
    let option: RequestInit = {
        method: method,
        headers: req.header
    }

    // 提交字符串
    let paramStr = req.isFormData ? (param as FormData) : getParamString(param, req.dataType)

    if (method == "GET") {
        req.url = fixedURL(req.url, paramStr as string)
        option.body = null
        param = undefined
    } else {
        option.body = paramStr || null
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // 默认 Content-Type
            req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
    }

    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With
        req.header["X-Requested-With"] = "XMLHttpRequest"
    }

    if (req.isCross) {
        // 跨域
        option.mode = "cors"
    }

    // 同域，默认带上cookie
    option.credentials = "same-origin"
    if (req.withCredentials && req.isCross) {
        // 发送请求，带上cookie 跨域
        option.credentials = "include"
    }

    // response.text then回调函数
    let fetchData = (data: any[]) => {
        res.text = data[0] as string
        res.result = data[1] || {}
        // 统一处理 返回数据
        responseEnd.call(this, course)
    }

    // fetch then回调函数
    function fetchBack(response: Response) {
        if (!req.outFlag) {
            // outFlag 为true，表示 中止了
            // 设置 headers 方便获取
            res.headers = response.headers

            // 状态吗
            res.status = response.status
            // 返回的字符串
            res.text = ""
            // 是否有错误
            res.err = response.ok ? null : "http error [" + res.status + "]"
            let results: Promise<any>[] = []
            try {
                results[0] = response.text()
            } catch (e) {}

            if (req.resType != "text" && req.resType != "json") {
                // 只是为了不报错
                results[1] = (response as any)[req.resType]()
            }

            Promise.all(results).then(fetchData, fetchData)
        }
        req.outFlag = false
    }

    // 发送事件处理
    this.emit("send", course)
    // 发送数据
    window.fetch(req.url, option).then(fetchBack, fetchBack)
}

// ===================================================================xhr 发送数据
// xhr的onload事件
function onload(this: Ajax, course: AjaxCourse): void {
    let { req, res } = course
    let xhr = req.xhr
    if (xhr && !req.outFlag) {
        // req.outFlag 为true 表示，本次ajax已经中止，无需处理
        try {
            // 获取所有可以的的header值（字符串）
            res.headers = xhr.getAllResponseHeaders()
        } catch (e) {}

        res.text = ""
        try {
            // 返回的文本信息
            res.text = xhr.responseText
        } catch (e) {}
        res.result = null
        try {
            // 返回的文本信息
            res.result = xhr.response
        } catch (e) {}

        // 默认状态值为 0
        res.status = 0
        try {
            // xhr status
            res.status = xhr.status
        } catch (e) {}
        // if(res.status === 0){
        //     res.status = res.text ? 200 : 404;
        // }
        let s = res.status
        // 默认只有当 正确的status才是 null， 否则是错误
        res.err = (s >= 200 && s < 300) || s === 304 || s === 1223 ? null : "http error [" + s + "]"
        // 统一后处理
        responseEnd.call(this, course)
    }
    delete req.xhr
    req.outFlag = false
}

/**
 * xhr 发送数据
 * @returns {ajax}
 */
function xhrSend(this: Ajax, course: AjaxCourse): void {
    let { res, req } = course
    // XHR
    req.xhr = new XMLHttpRequest()

    // xhr 请求方法
    let method = String(req.method || "GET").toUpperCase()

    if (req.withCredentials) {
        // xhr 跨域带cookie
        req.xhr.withCredentials = true
    }

    let paramStr: string | FormData | null = req.isFormData ? (req.param as FormData) : getParamString(req.param, req.dataType)

    if (method == "GET") {
        // get 方法，参数都组合到 url上面
        req.xhr.open(method, fixedURL(req.url, paramStr as string), true)
        paramStr = null
    } else {
        req.xhr.open(method, req.url, true)
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // Content-Type 默认值
            req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
    }
    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With 如果增加，容易出现问题，需要可以通过 事件设置
        req.header["X-Requested-With"] = "XMLHttpRequest"
    }

    // XDR 不能设置 header
    forEach(req.header, function(v, k) {
        let xhr = req.xhr as XMLHttpRequest
        xhr.setRequestHeader(k as string, v)
    })
    res.status = 0

    if (this.hasEvent("progress")) {
        // 跨域 加上 progress post请求导致 多发送一个 options 的请求
        // 只有有进度需求的任务,才加上
        try {
            req.xhr.upload.onprogress = event => {
                course.progress = event
                this.emit("progress", course)
            }
        } catch (e) {}
    }

    //发送请求

    // onload事件
    req.xhr.onload = onload.bind(this, course)

    // 发送前出发send事件
    this.emit("send", course)

    if (["arraybuffer", "blob"].indexOf(req.resType) >= 0) {
        req.xhr.responseType = req.resType as XMLHttpRequestResponseType
    }

    // 发送请求，注意要替换
    if (typeof paramStr == "string") {
        // eslint-disable-next-line
        paramStr = paramStr.replace(/[\x00-\x08\x11-\x12\x14-\x20]/g, "*")
    }
    req.xhr.send(paramStr)
}
