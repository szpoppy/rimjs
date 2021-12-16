import { Ajax, AjaxCourse, ajaxGlobal, getParamString, fixedURL, getDefaultContentType, responseEnd } from "./lib"
import { default as fetch, RequestInit, Response } from "node-fetch"
import * as FormData from "form-data"

// 实现具体的请求
ajaxGlobal.isFormData = function(para: any) {
    return para instanceof FormData
}
ajaxGlobal.fetchExecute = function(course, ajax) {
    let { req } = course
    req.isCross = false
    nodeFetchSend.call(ajax, course)
}

// fetch 发送数据
function nodeFetchSend(this: Ajax, course: AjaxCourse): void {
    let { req, res } = course
    // 方法
    let method = req.method

    // 参数
    let param = req.param

    // fetch option参数
    let option: RequestInit = {
        method: method,
        headers: req.header
    }

    if (method == "GET") {
        req.url = fixedURL(req.url, getParamString(param) as string)
        option.body = null
        param = undefined
    } else {
        option.body = (req.isFormData ? (param as any) : (getParamString(param, req.dataType) as string)) || null
        if (req.header["Content-Type"] === undefined && !req.isFormData) {
            // 默认 Content-Type
            req.header["Content-Type"] = getDefaultContentType(req.dataType)
        }
    }

    if (req.header["X-Requested-With"] === undefined && !req.isCross) {
        // 跨域不增加 X-Requested-With
        req.header["X-Requested-With"] = "XMLHttpRequest"
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
    fetch(req.url, option).then(fetchBack, fetchBack)
}
