import Event from "../event"
import { merge } from "../assign"
import getUUID from "../sole"
import forEach from "../each"
import qs from "../qs"

// ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
export function fixedURL(url: string, paramStr: string): string {
    if (paramStr) {
        return url + (url.indexOf("?") > -1 ? "&" : "?") + paramStr
    }
    return url
}

// ===================================================================== 参数转为 字符串
export function getParamString(param?: FormData | IParam | string, dataType?: string): string | FormData {
    if (!param) {
        return ""
    }
    // if (param instanceof FormData) {
    //     return param
    // }
    if (typeof param == "string") {
        return param || ""
    }
    let str = dataType == "json" ? JSON.stringify(param) : qs.stringify(param as any)
    return str
}

// ===================================================================== 获取默认的 Content-Type 的值
export function getDefaultContentType(dataType?: string): string {
    if (dataType == "json") {
        return "application/json"
    }
    return "application/x-www-form-urlencoded"
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

// ==================================================================== 接口
interface IFStrObj {
    [propName: string]: string
}
interface IParam {
    [propName: string]: number | string | boolean | Array<number | string | boolean> | IParam
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

    // constructor() {}
}

export class AjaxRes {
    jsonKey: string = "json"
    headers?: any = ""
    status?: number
    text?: string
    json?: object
    cancel?: boolean
    err?: any
    result?: any;
    [propName: string]: any

    // constructor() {}

    getData(prot: string, data?: any): any {
        if (data === undefined) {
            data = this[this.jsonKey]
        }

        return getSafeData(data, prot)
    }

    getHeader(key: string): string {
        if (typeof this.headers == "string") {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(this.headers as string) ? RegExp.$1 : ""
        }
        return (this.headers.get && this.headers.get(key)) || ""
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
    then(): Promise<AjaxCourse>
    then(thenFn: (course: AjaxCourse) => any): Promise<any>
    then(thenFn?: (course: AjaxCourse) => any): Promise<AjaxCourse | any> {
        let pse: Promise<AjaxCourse> = new Promise((resolve, reject) => {
            this.on("callback", function(course) {
                resolve(course)
            })
            this.on("timeout", function() {
                // eslint-disable-next-line
                reject({ err: "访问超时", errType: 1 })
            })
            this.on("abort", function() {
                // eslint-disable-next-line
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
type groupLoadOnNew = (ajax: Ajax) => void
function groupLoad(target: AjaxGroup, url: string | IFAjaxConf, callback?: IEventOnFn | sendParam, param?: sendParam | groupLoadOnNew, onNew?: groupLoadOnNew) {
    let opt = typeof url == "string" ? { url } : url

    if (callback && typeof callback != "function") {
        onNew = param as groupLoadOnNew
        param = callback
        callback = undefined
    }

    let one = new Ajax(target, opt)
    onNew && onNew(one)
    if (typeof callback == "function") {
        one.on("callback", callback)
    }
    one.send(param as sendParam)
    return one
}

let ajaxDateDiff: number = 0
export class AjaxGroup extends Event {
    dateDiff: number = ajaxDateDiff
    conf: IFAjaxConf = {}

    // global?: Global

    parent?: Global

    // Group?: AjaxGroupConstructor

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

export class Global extends Event {
    conf: IFAjaxConf = { useFetch: true, resType: EResType.json, jsonpKey: "callback", cache: true }

    on(type: string, fn: (arg: AjaxCourse) => void, isPre: boolean = false): void {
        this[":on"]<Global>(type, fn, isPre)
    }

    // constructor() {
    //     super()
    // }

    setConf(conf: IFAjaxConf) {
        getConf(conf, this.conf)
    }

    // eslint-disable-next-line
    isFormData(data: any) {
        // eslint-disable-next-line
        console.log("no isFormData Fn")
        return false
    }

    // eslint-disable-next-line
    fetchExecute(course: AjaxCourse, ajax: Ajax) {
        // eslint-disable-next-line
        console.log("no fetchExecute Fn")
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
            req.path = s1
            return req.paths[s1] || s0
        })

    let httpReg = new RegExp("^(:?http(:?s)?:)?//", "i")
    if (req.baseURL && !httpReg.test(req.url)) {
        // 有baseURL 并且不是全量地址
        req.formatURL = req.baseURL + req.formatURL
    }

    // 确认短路径后
    this.emit("path", course)

    // 是否为 FormData
    let isFormData = ajaxGlobal.isFormData(param)
    // if (FormData && param instanceof FormData) {
    //     isFormData = true
    // }
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
    req.method = method
    if (method == "GET") {
        let para = req.param as IParam
        if (para && req.cache === false && !para._r_) {
            // 加随机数，去缓存
            para._r_ = getUUID()
        }
    }

    req.url = req.formatURL

    ajaxGlobal.fetchExecute(course, this)
}

// 结束 统一处理返回的数据
export function responseEnd(this: Ajax, course: AjaxCourse): void {
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
        // console.log("this.parent", this)
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
