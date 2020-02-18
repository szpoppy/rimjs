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
                let parent = node.parentNode as HTMLElement
                parent.removeChild(node)
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
function getSafeData(data: any, property: string): any {
    if (property && data) {
        let props = property.split(".")
        for (let i = 0; i < props.length; i += 1) {
            data = data[props[i]]
            if (data == null) {
                return null
            }
        }
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
function getParamString(param?: FormData | IParam | string, dataType?: string): string | FormData {
    if (!param) {
        return ""
    }
    if (param instanceof FormData) {
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
interface IParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean>
}

type sendParam = IParam | FormData | string

enum EResType {
    // eslint-disable-next-line
    json = "json",
    // eslint-disable-next-line
    text = "text"
}

export interface IFAjaxConf {
    baseURL?: string
    paths?: IFStrObj
    useFetch?: boolean
    url?: string
    method?: string
    dataType?: string
    resType?: EResType
    param?: IParam | string
    header?: IFStrObj
    jsonpKey?: string
    cache?: boolean
    withCredentials?: boolean
}
// ==================================================================== 资源返回类

export class AjaxReq {
    baseURL?: string
    paths: IFStrObj = {}
    useFetch: boolean = true
    url: string = ""
    method: string = "GET"
    dataType: string = ""
    resType: EResType = EResType.text
    param?: IParam | string | FormData
    header: IFStrObj = {}
    jsonpKey: string = ""
    cache: boolean = false
    withCredentials: boolean = true

    xhr?: XMLHttpRequest
    path: string = ""
    orginURL: string = ""
    formatURL: string = ""
    isFormData: boolean = false
    isCross: boolean = false
    outFlag: boolean = false;

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
            return this.headers.get(key) || ""
        }
        return ""
    }
}

export class AjaxCourse {
    req: AjaxReq = new AjaxReq()
    res: AjaxRes = new AjaxRes()
    progress?: ProgressEvent
    ajax: Ajax

    getDate(this: AjaxCourse): Date {
        return this.ajax.parent.getDate()
    }

    constructor(ajax: Ajax) {
        this.ajax = ajax
    }
}

export class Ajax extends Event {
    _course?: AjaxCourse
    conf: IFAjaxConf
    parent: AjaxGroup

    on(type: string, fn: (arg: AjaxCourse) => void, isPre: boolean = false): void {
        this[":on"]<Ajax>(type, fn, isPre)
    }

    constructor(parent: AjaxGroup, opt?: IFAjaxConf) {
        super(parent)
        this.parent = parent
        this.conf = merge({}, ajaxGlobal.conf, parent.conf, getConf(opt))
    }

    // 设置参数
    setConf(opt: IFAjaxConf = {}): Ajax {
        getConf(opt, this.conf)
        return this
    }

    // 中止 请求
    abort(): Ajax {
        ajaxAbort(this, true)
        return this
    }

    // 超时
    timeout(this: Ajax, time: number, callback: IEventOnFn): Ajax {
        setTimeout(() => {
            let course = this._course
            if (course) {
                let { req } = course
                if (req) {
                    // 超时 设置中止
                    ajaxAbort(this)
                    // 出发超时事件
                    this.emit("timeout", course)
                }
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
        let course = new AjaxCourse(this)
        let req = course.req
        this._course = course
        // 异步，settime 部分参数可以后置设置生效
        setTimeout(() => {
            merge(req, this.conf)
            requestSend.call(this, param || {}, course)
        }, 1)
        return this
    }

    // 返回Promist
    then(thenFn?: (course: AjaxCourse) => any): Promise<any> {
        let pse: Promise<any> = new Promise((resolve, reject) => {
            this.on("callback", function(course) {
                resolve(course)
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

function groupLoad(target: AjaxGroup, url: string | IFAjaxConf, callback?: IEventOnFn | sendParam, param?: sendParam, onNew?: Function) {
    let opt = typeof url == "string" ? { url } : url

    if (callback && typeof callback != "function") {
        param = callback
        callback = undefined
    }

    let one = new Ajax(target, opt)
    onNew && onNew(one)
    if (typeof callback == "function") {
        one.on("callback", callback)
    }
    one.send(param)
    return one
}

let ajaxDateDiff: number = 0

interface AjaxGroupConstructor {
    new (opt?: IFAjaxConf): AjaxGroup
}

export class AjaxGroup extends Event {
    dateDiff: number = ajaxDateDiff
    conf: IFAjaxConf = {}

    global?: Global

    parent?: Global

    Group?: AjaxGroupConstructor

    on(type: string, fn: (arg: AjaxCourse) => void, isPre: boolean = false): void {
        this[":on"]<AjaxGroup>(type, fn, isPre)
    }

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
    shortcut(opt: IFAjaxConf, events?: shortcutEvent) {
        return (callback: IEventOnFn | sendParam, param: sendParam): Ajax => {
            return groupLoad(this, opt, callback, param, function(one: Ajax) {
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
    load(url: string | IFAjaxConf, callback?: IEventOnFn | sendParam, param?: sendParam): Ajax {
        return groupLoad(this, url, callback, param)
    }

    // promise
    fetch(opt?: IFAjaxConf, param?: sendParam): Promise<any> {
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

class Global extends Event {
    conf: IFAjaxConf = { useFetch: true, resType: EResType.json, jsonpKey: "callback", cache: true }

    on(type: string, fn: (arg: AjaxCourse) => void, isPre: boolean = false): void {
        this[":on"]<Global>(type, fn, isPre)
    }

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
    let paramStr = getParamString(param, req.dataType)

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
        if (req.withCredentials) {
            // 发送请求，带上cookie
            option.credentials = "include"
        }
    } else {
        // 同域，默认带上cookie
        option.credentials = "same-origin"
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
                results[1] = response[req.resType]()
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
        responseEnd.call(this, course)
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
    req.xhr = new XMLHttpRequest()

    // xhr 请求方法
    let method = String(req.method || "GET").toUpperCase()

    if (req.withCredentials) {
        // xhr 跨域带cookie
        req.xhr.withCredentials = true
    }

    let paramStr: string | FormData | null = getParamString(req.param, req.dataType)

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

    // 之前发出
    this.emit("before", course)

    req.path = ""
    req.orginURL = req.url || ""

    // let paths = req.paths || {}

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
    if (FormData && param instanceof FormData) {
        isFormData = true
    }
    req.isFormData = isFormData

    // 请求类型
    let dataType = (req.dataType = String(req.dataType || "").toLowerCase())

    if (isFormData) {
        // FormData 将参数都添加到 FormData中
        forEach(req.param, function(value, key) {
            let fd = <FormData>param
            fd.append(key as string, value)
        })
        req.param = param
    } else {
        if (typeof param == "string") {
            // 参数为字符串，自动格式化为 object，后面合并后在序列化
            param = dataType == "json" ? JSON.parse(param) : qs.parse(param)
        }
        merge(req.param as IParam, (param as IParam) || {})
    }

    // 数据整理完成
    this.emit("open", course)

    // 还原,防止复写， 防止在 open中重写这些参数
    req.isFormData = isFormData
    req.dataType = dataType

    let method = String(req.method || "get").toUpperCase()
    if (method == "GET") {
        let para = req.param as IParam
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
        jsonpSend.call(this, course)
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
function ajaxAbort(target: Ajax, flag: boolean = false): void {
    let course = target._course
    if (course) {
        let { req } = course
        // 设置outFlag，会中止回调函数的回调
        req.outFlag = true
        if (req.xhr) {
            // xhr 可以原声支持 中止
            req.xhr.abort()
            req.xhr = undefined
        }
        delete target._course
        flag && target.emit("abort", course)
    }
}

let def = new AjaxGroup()

// 全局
def.global = ajaxGlobal
def.Group = AjaxGroup

export default def
