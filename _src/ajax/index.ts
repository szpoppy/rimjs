import qs from "../qs"
import forEach from "../each"
import getUUID from "../sole"
import Event from "../event"
import { merge } from "../assign"

// 当前host
const host: string = window.location.host

// 是否原声支持 fetch
const hasFetch: boolean = !!window.fetch
// ========================================================================= 事件

// ========================================================================= 动态加载js
// jsonp 加载方式需要使用
let head: HTMLElement = document.head || document.getElementsByTagName("head")[0] || document.documentElement
function loadJS(url: string, callback: Function): HTMLScriptElement {
    // 创建节点
    let node: HTMLScriptElement = document.createElement("script")
    // 设置属性
    node.setAttribute("type", "text/javascript")
    node.onload = node.onerror = function() {
        node.onload = node.onerror = null
        callback && callback()
        setTimeout(function() {
            //防止回调的时候，script还没执行完毕
            // 延时 2s 删除节点
            if (node) {
                node.parentNode.removeChild(node)
                node = null
            }
        }, 2000)
    }
    node.async = true
    head.appendChild(node)
    node.src = url
    return node
}

// ===================================================================== 获得url的真实地址
// 判断请求是否为跨域使用
let linkA = document.createElement("a")
function getFullUrl(url: string): string {
    linkA.setAttribute("href", url)
    return linkA.href
}

// ===================================================================== 安全获取子对象数据
function getSafeData(data: object, property: string): any {
    if (property && data) {
        property.split(".").forEach(function(item) {
            data = data[item]
            if (data == null) {
                return false
            }
        })
    }
    return data
}

// ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
function fixedURL(url: string, paramStr: string): string {
    if (paramStr) {
        return url + (url.indexOf("?") > -1 ? "&" : "?") + paramStr
    }
    return url
}

// ===================================================================== 参数转为 字符串
function getParamString(param?: FormData | IFParam | string, dataType?: string): string | FormData {
    if (!param) {
        return ""
    }
    if (param instanceof window.FormData) {
        return param
    }
    if (typeof param == "string") {
        return param || ""
    }
    let str = dataType == "json" ? JSON.stringify(param) : qs.stringify(param)
    return str
}

// ===================================================================== 获取默认的 Content-Type 的值
function getDefaultContentType(dataType?: string): string {
    if (dataType == "json") {
        return "application/json"
    }
    return "application/x-www-form-urlencoded"
}

// ==================================================================== 接口
interface IFStrObj {
    [propName: string]: string
}
interface IFParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean>
}

type sendParam = IFParam | FormData | string

interface IFAjaxEventFn<T1, T2 = null> {
    (this: T1, arg?: T2): void
}

export interface IFAjaxEvent<T> {
    callback?: IFAjaxEventFn<T, AjaxRes>[]
    verify?: IFAjaxEventFn<T, AjaxRes>[]
    timeout?: IFAjaxEventFn<T>[]
    send?: IFAjaxEventFn<T, AjaxReq>[]
    open?: IFAjaxEventFn<T, AjaxReq>[]
    path?: IFAjaxEventFn<T, AjaxReq>[]
    abort?: IFAjaxEventFn<T>[]
    progress?: IFAjaxEventFn<T, ProgressEvent>[]
    [propName: string]: IFAjaxEventFn<T, any>[]
}

export interface IFAjaxConf {
    baseURL?: string
    paths?: IFStrObj
    useFetch?: boolean
    url?: string
    method?: string
    dataType?: string
    resType?: string
    param?: IFParam | string
    header?: IFStrObj
    jsonpKey?: string
    cache?: boolean
    withCredentials?: boolean
}
// ==================================================================== 资源返回类

export class AjaxReq {
    baseURL?: string
    paths?: IFStrObj
    useFetch?: boolean
    url?: string
    method?: string
    dataType?: string
    resType?: string
    param?: IFParam | string | FormData
    header?: IFStrObj
    jsonpKey?: string
    cache?: boolean
    withCredentials?: boolean

    xhr?: XMLHttpRequest
    path?: string
    orginURL?: string
    formatURL?: string
    isFormData?: boolean
    isCross?: boolean

    outFlag?: boolean;

    [propName: string]: any

    constructor() {}
}

export class AjaxRes {
    jsonKey: string = "json"
    headers?: Headers | string = ""
    status?: number
    text?: string
    json?: object
    cancel?: boolean
    err?: any
    result?: any;
    [propName: string]: any

    constructor() {}

    getData(prot: string, data?: any): any {
        if (data === undefined) {
            data = this[this.jsonKey]
        }

        return getSafeData(data, prot)
    }

    getHeader(key: string): string {
        if (typeof this.headers == "string") {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.headers as string) ? RegExp["$1"] : ""
        }
        if (this.headers instanceof Headers) {
            return this.headers.get(key)
        }
        return ""
    }
}

export class AjaxCourse {
    req?: AjaxReq
    res?: AjaxRes
    progress?: ProgressEvent
    parent?: Ajax

    getDate(): Date {
        return this.parent.parent.getDate()
    }
}

export class Ajax extends Event<Ajax, AjaxCourse> {
    _course?: AjaxCourse
    conf?: IFAjaxConf
    parent?: AjaxGroup

    constructor(parent: AjaxGroup, opt: IFAjaxConf) {
        super()
        this.conf = merge({}, ajaxGlobal.conf, parent.conf, getConf(opt))
    }

    // 设置参数
    setConf(opt: IFAjaxConf = {}): Ajax {
        getConf(opt, this.conf)
        return this
    }

    // 扩展
    assign(...args: any): Ajax {
        if (typeof args[0] === "string") {
            this.assign({ [args[0]]: args[1] })
        } else {
            args.unshift(this)
            merge.apply(Object, args)
        }
        return this
    }

    // 中止 请求
    abort(): Ajax {
        ajaxAbort.call(this, true)
        return this
    }

    // 超时
    timeout(this: Ajax, time: number, callback: IEventOnFn): Ajax {
        setTimeout(() => {
            let course = this._course
            let { req } = course
            if (req) {
                // 超时 设置中止
                ajaxAbort.call(this)
                // 出发超时事件
                this.emit("timeout", course)
            }
        }, time)
        callback && this.on("timeout", callback)
        return this
    }

    // 发送数据， over 代表 是否要覆盖本次请求
    send(this: Ajax, param?: sendParam, over: boolean = false): Ajax {
        if (this._course) {
            // 存在 _req
            if (!over) {
                // 不覆盖，取消本次发送
                return this
            }
            // 中止当前的
            this.abort()
        }

        // 制造 req
        let course = new AjaxCourse()
        course.parent = this
        let req = (course.req = new AjaxReq())
        this._course = course
        // 异步，settime 部分参数可以后置设置生效
        setTimeout(() => {
            merge(req, this.conf)
            requestSend.call(this, param || {}, course)
        }, 1)
        return this
    }

    // 返回Promist
    then(thenFn?: () => any): Promise<any> {
        let pse: Promise<any> = new Promise((resolve, reject) => {
            this.on("callback", function({ res }) {
                resolve(res)
            })
            this.on("timeout", function() {
                reject({ err: "访问超时", errType: 1 })
            })
            this.on("abort", function() {
                reject({ err: "访问中止", errType: 2 })
            })
        })
        return (thenFn && pse.then(thenFn)) || pse
    }
}

type IEventOnFn = (this: Ajax, arg: AjaxCourse) => void
interface shortcutEventObj {
    [propName: string]: IEventOnFn
}
type shortcutEvent = shortcutEventObj | IEventOnFn

function groupLoad(this: AjaxGroup, url: string | IFAjaxConf, callback: IEventOnFn | sendParam, param: sendParam, onNew?: Function) {
    let opt = typeof url == "string" ? { url } : url

    if (callback && typeof callback != "function") {
        param = callback
        callback = null
    }

    let one = new Ajax(this, opt)
    onNew && onNew(one)
    if (typeof callback == "function") {
        one.on("callback", callback)
    }
    one.send(param)
    return one
}

let ajaxDateDiff: number = 0

export class AjaxGroup extends Event<AjaxGroup, AjaxCourse> {
    dateDiff?: number = ajaxDateDiff
    conf?: IFAjaxConf

    global?: Global

    parent?: Global

    constructor(opt?: IFAjaxConf) {
        super(ajaxGlobal)
        this.conf = {}
        opt && this.setConf(opt)
    }

    // 设置默认
    setConf(opt?: IFAjaxConf): AjaxGroup {
        opt && getConf(opt, this.conf)
        return this
    }

    // 创建一个ajax
    create(opt?: IFAjaxConf): Ajax {
        return new Ajax(this, opt)
    }

    // 快捷函数
    shortcut(this: AjaxGroup, opt: IFAjaxConf, events?: shortcutEvent) {
        return (callback: Function, param: sendParam): Ajax => {
            return groupLoad.call(this, opt, callback, param, function(one: Ajax) {
                if (events) {
                    if (typeof events == "function") {
                        one.on("callback", events)
                        return
                    }
                    for (let n in events) {
                        one.on(n, events[n])
                    }
                }
            })
        }
    }

    // 创建并加载
    load(this: AjaxGroup): Ajax {
        return groupLoad.apply(this, arguments)
    }

    get(this: AjaxGroup): Ajax {
        return groupLoad.apply(this, arguments).setConf({ method: "get" })
    }
    post(this: AjaxGroup): Ajax {
        return groupLoad.apply(this, arguments).setConf({ method: "post" })
    }
    put(this: AjaxGroup): Ajax {
        return groupLoad.apply(this, arguments).setConf({ method: "put" })
    }
    jsonp(this: AjaxGroup): Ajax {
        return groupLoad.apply(this, arguments).setConf({ method: "jsonp" })
    }

    // promise
    fetch(this: AjaxGroup, opt?: IFAjaxConf, param?: sendParam): Promise<any> {
        return this.create(opt)
            .send(param)
            .then()
    }

    setDate(date: string | Date): void {
        if (typeof date == "string") {
            date = new Date(date.replace(/T/, " ").replace(/\.\d+$/, ""))
        }
        this.dateDiff = ajaxDateDiff = date.getTime() - new Date().getTime()
    }
    // 获取 服务器时间
    getDate(): Date {
        return new Date(this.dateDiff + new Date().getTime())
    }
}

class Global extends Event<Global, AjaxCourse> {
    conf?: IFAjaxConf = { useFetch: true, resType: "json", jsonpKey: "callback", cache: true }

    constructor() {
        super()
    }

    setConf(conf: IFAjaxConf) {
        getConf(conf, this.conf)
    }
}
export let ajaxGlobal = new Global()

// 统一设置参数
function getConf({ baseURL, paths, useFetch, url, method, dataType, resType, param = {}, header = {}, jsonpKey, cache, withCredentials }: IFAjaxConf = {}, val: IFAjaxConf = {}): IFAjaxConf {
    if (baseURL) {
        val.baseURL = baseURL
    }

    if (paths) {
        val.paths = paths
    }

    if (typeof useFetch == "boolean") {
        val.useFetch = useFetch
    }

    if (url) {
        // url  ==> req
        val.url = url
    }

    if (method) {
        // 方法 ==> req
        val.method = method.toUpperCase()
    }

    if (param) {
        // 参数  ==> req
        val.param = param
    }

    if (header) {
        // 请求头设置 ==> req
        val.header = header
    }

    if (dataType) {
        // 缓存 get ==> req
        val.dataType = dataType
    }
    if (resType) {
        // 返回数据类型
        val.resType = resType
    }

    if (jsonpKey) {
        val.jsonpKey = jsonpKey
    }

    if (typeof cache == "boolean") {
        val.cache = cache
    }

    if (typeof withCredentials == "boolean") {
        val.withCredentials = withCredentials
    }
    return val
}

// 结束 统一处理返回的数据
function responseEnd(this: Ajax, course: AjaxCourse): void {
    let { req, res } = course
    if (!res.json && res.text) {
        // 尝试格式为 json字符串

        try {
            res.json = JSON.parse(res.text)
        } catch (e) {
            res.json = {}
        }
    }
    if (req.resType == "json") {
        res.result = res.json
    }

    let date = res.getHeader("Date")
    if (date) {
        this.parent.setDate(date)
    }

    delete this._course

    // 出发验证事件
    this.emit("verify", course)

    if (res.cancel === true) {
        // 验证事件中设置 res.cancel 为false，中断处理
        return
    }
    // callback事件，可以看做函数回调
    this.emit("callback", course)
}

// ============================================== jsonp
function jsonpSend(this: Ajax, course: AjaxCourse): void {
    // req
    let { req, res } = course

    // 参数
    let param = req.param

    // callback
    let key = req.jsonpKey
    // jsonp回调字符串
    let backFunKey = param[key]
    if (!backFunKey) {
        // 没设置，自动设置一个
        param[key] = backFunKey = "jsonp_" + getUUID()
    }

    // 控制，只出发一次回调
    let backFunFlag
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
                responseEnd.call(this, res)
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
    let paramStr = getParamString(param, req.dataType)

    if (method == "GET") {
        req.url = fixedURL(req.url, paramStr as string)
        option.body = param = null
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
        if (req.withCredentials) {
            // 发送请求，带上cookie
            option.credentials = "include"
        }
    } else {
        // 同域，默认带上cookie
        option.credentials = "same-origin"
    }

    // response.text then回调函数
    let fetchData = ([text, result]) => {
        res.text = text
        res.result = result
        // 统一处理 返回数据
        responseEnd.call(this, res)
    }

    // fetch then回调函数
    function fetchBack(response) {
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
            let results = ["", null]
            try {
                results[0] = response.text()
            } catch (e) {}

            if (["json", "text"].indexOf(req.resType) < 0) {
                try {
                    results[1] = response[req.resType]()
                } catch (e) {}
            }

            Promise.all(results).then(fetchData, fetchData)
        }
        delete req.outFlag
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
        responseEnd.call(this, res)
    }
    delete req.xhr
    delete req.outFlag
}

/**
 * xhr 发送数据
 * @returns {ajax}
 */
function xhrSend(this: Ajax, course: AjaxCourse): void {
    let { res, req } = course
    // XHR
    req.xhr = new window.XMLHttpRequest()

    // xhr 请求方法
    let method = String(req.method || "GET").toUpperCase()

    if (req.withCredentials) {
        // xhr 跨域带cookie
        req.xhr.withCredentials = true
    }

    let paramStr = getParamString(req.param, req.dataType)

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
    forEach(req.header, function(v: string, k: string) {
        req.xhr.setRequestHeader(k, v)
    })
    res.status = 0

    if (this.hasEvent("progress")) {
        // 跨域 加上 progress post请求导致 多发送一个 options 的请求
        // 只有有进度需求的任务,才加上
        try {
            req.xhr.upload.onprogress = event => {
                let p = new AjaxCourse()
                p.progress = event
                this.emit("progress", p)
            }
        } catch (e) {}
    }

    //发送请求

    // onload事件
    req.xhr.onload = onload.bind(this, res)

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

// 发送数据整理
function requestSend(this: Ajax, param: sendParam, course: AjaxCourse) {
    let { req } = course
    // console.log("xxxx", param, req);
    if (req.outFlag) {
        // 已经中止
        return
    }

    // 方法
    req.method = String(req.method || "get").toUpperCase()

    // callback中接收的 res
    let res = (course.res = new AjaxRes())

    // 之前发出
    this.emit("before", course)

    req.path = ""
    req.orginURL = req.url
    // 短路径替换
    req.formatURL = req.orginURL
        // 自定义req属性
        .replace(/^<([\w,:]*)>/, function(s0: string, s1: string) {
            s1.split(/,+/).forEach(function(key: string) {
                let [k1, k2] = key.toLowerCase().split(/:+/)
                if (k2 === undefined) {
                    k2 = k1
                    k1 = "method"
                }
                req[k1] = k2
            })
            return ""
        })
        // 短路经
        .replace(/^(\w+):(?!\/\/)/, (s0: string, s1: string) => {
            req.path = s0
            return req.paths[s1] || s0
        })

    if (req.baseURL && !/^(:?http(:?s)?:)?\/\//i.test(req.url)) {
        // 有baseURL 并且不是全量地址
        req.formatURL = req.baseURL + req.formatURL
    }

    // 确认短路径后
    this.emit("path", course)

    // 是否为 FormData
    let isFormData = false
    if (window.FormData && param instanceof window.FormData) {
        isFormData = true
    }
    req.isFormData = isFormData

    // 请求类型
    let dataType = (req.dataType = String(req.dataType || "").toLowerCase())

    if (isFormData) {
        // FormData 将参数都添加到 FormData中
        forEach(req.param, function(value, key) {
            ;(<FormData>param).append(key, value)
        })
        req.param = param
    } else {
        if (typeof param == "string") {
            // 参数为字符串，自动格式化为 object，后面合并后在序列化
            param = dataType == "json" ? JSON.parse(param) : qs.parse(param)
        }
        merge(req.param as IFParam, (param as IFParam) || {})
    }

    // 数据整理完成
    this.emit("open", course)

    // 还原,防止复写， 防止在 open中重写这些参数
    req.isFormData = isFormData
    req.dataType = dataType

    let method = String(req.method || "get").toUpperCase()
    if (method == "GET") {
        let para = req.param as IFParam
        if (para && req.cache === false && !para._r_) {
            // 加随机数，去缓存
            para._r_ = getUUID()
        }
    }

    // 是否跨域, 获全路径后，比对
    req.isCross = !/:\/\/$/.test(getFullUrl(req.formatURL).split(host)[0] || "")

    req.url = req.formatURL
    if (method == "JSONP") {
        // jsonp 获取数据
        jsonpSend.call(this, res)
        return
    }

    if (hasFetch && req.useFetch && !this.hasEvent("progress")) {
        //fetch 存在 fetch 并且无上传或者进度回调 只能异步
        fetchSend.call(this, course)
        return
    }

    // 走 XMLHttpRequest
    xhrSend.call(this, course)
}

// 中止
function ajaxAbort(this: Ajax, flag: boolean): void {
    let course = this._course
    let { req } = course
    if (req) {
        // 设置outFlag，会中止回调函数的回调
        req.outFlag = true
        if (req.xhr) {
            // xhr 可以原声支持 中止
            req.xhr.abort()
            req.xhr = null
        }
        delete this._course
        flag && this.emit("abort", course)
    }
}

let def = new AjaxGroup()

// 全局
def.global = ajaxGlobal

export default def

ajaxGlobal.on("callback", function({ res }) {})
