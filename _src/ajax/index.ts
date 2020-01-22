import qs from "../qs"
import forEach from "../each"
import Event from "../event"
import getUUID from "../sole"

// 用于类型判断
const _toString: Function = Object.prototype.toString

// 当前host
const host: string = window.location.host

// 是否原声支持 fetch
const hasFetch: boolean = !!window.fetch

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
function getParamString(param?: FormData | object | string, dataType?: string): string | FormData {
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
interface IFReq {}

interface IFConf {
    baseURL?: string
    paths?: IFStrObj
    useFetch?: boolean
    url?: string
    method?: string
    dataType?: string
    resType?: string
    param?: IFParam | FormData
    header?: IFStrObj
    jsonpKey?: string
    cache?: boolean
    withCredentials?: boolean
}
// ==================================================================== 资源返回类

class Req {
    path?: string
    orginURL?: string
    formatURL?: string
    baseURL?: string
    url?: string
    isFormData?: boolean
    method?: string
    dataType?: string
    param?: IFParam | FormData
    cache?: boolean
    isCross?: boolean

    root?: Ajax

    outFlag?: boolean

    constructor() {}
}

class Res {
    withReq: Req
    jsonKey: string = "json"

    root?: Ajax

    headers?: Headers | string
    status?: string
    text?: string
    err?: any
    

    constructor() {}

    getDate(): Date {
        return this.root.root.getDate()
    }

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

class Ajax {
    root?: Group
    private _req?: Req
    conf?: IFConf
}

class Group {
    dateDiff?: number = 0
    setDate(date: string | Date): void {
        if (typeof date == "string") {
            date = new Date(date.replace(/T/, " ").replace(/\.\d+$/, ""))
        }
        this.dateDiff = date.getTime() - new Date().getTime()
    }
    // 获取 服务器时间
    getDate(): Date {
        return new Date(this.dateDiff + new Date().getTime())
    }
}

// 结束 统一处理返回的数据
function responseEnd(res) {
    let req = res.withReq
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
        this.root.setDate(date)
    }

    delete this._req

    // 出发验证事件
    this.emit("verify", res)

    if (res.cancel === true) {
        // 验证事件中设置 res.cancel 为false，中断处理
        return
    }
    // callback事件，可以看做函数回调
    this.emit("callback", res)
}