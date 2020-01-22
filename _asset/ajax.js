;(function(global, factory) {
    // UMD 加载方案
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory()
        return
    }
    if (typeof global.define === 'function' && global.define.amd) {
        global.define(factory)
        return
    }
    global.requestFn = factory()
})(window, function() {
    'use strict'

    // toString
    let toString = Object.prototype.toString
    // 当前页面的域名， 带端口号
    let host = window.location.host
    // 是否原声支持 fetch
    let hasFetch = !!window.fetch

    // ============================================ 事件函数
    function onEvent(type, fn, isPre = false) {
        let evs = this.events[type]
        if (!evs) {
            evs = this.events[type] = []
        }
        evs[isPre ? 'unshift' : 'push'](fn)
        return this
    }

    function offEvent(type, fn) {
        if (!type) {
            this.events = {}
            return this
        }
        if (!fn) {
            delete this.events[type]
            return this
        }
        let evs = this.events[type]
        if (!evs) {
            return this
        }
        let index = evs.indexOf(fn)
        if (index >= 0) {
            evs.splice(index, 1)
        }
        return this
    }

    function emitEvent(events, self, args) {
        if (events && events.length) {
            for (let i = 0; i < events.length; i += 1) {
                events[i].apply(self, args)
            }
        }
        return args
    }

    // ==================================== 事件循环
    /**
     * 数据循环
     * @param {Array、Object} arr 循环的数据
     * @param {Function} fun 每次循环执行函数
     * @param {Array} exe fun return后推入次数组
     */
    let forEach = (function() {
        function forpush(arr, v) {
            arr.push(v)
            return v
        }

        function forappend(obj, v, k) {
            obj[k] = v
        }

        function forback() {
            return arguments[1]
        }

        // 支持for循环的 数据
        const types = '-[object array]-[object nodelist]-[object htmlcollection]-[object arguments]-'

        return function(arr, fun, exe) {
            if (arr) {
                let doExe = exe ? (exe.push ? forpush : forappend) : forback
                let len = arr.length
                let isStop = false
                function stop() {
                    isStop = true
                }
                if (types.indexOf('-' + toString.call(arr).toLowerCase() + '-') > -1 || '[object htmlcollection]' == String(arr).toLowerCase()) {
                    for (let i = 0; i < len; i += 1) {
                        let item = fun(arr[i], i, stop)
                        if (isStop) {
                            break
                        }
                        doExe(exe, item, i)
                    }
                } else {
                    for (let n in arr) {
                        if (!arr.hasOwnProperty || arr.hasOwnProperty(n)) {
                            let item = fun(arr[n], n, stop)
                            if (isStop) {
                                break
                            }
                            doExe(exe, item, n)
                        }
                    }
                }
            }
            return exe
        }
    })()

    // ====================================querystring
    // URL 查询字符串
    let qs = {
        parse: function(str, opt) {
            let sep = (opt && opt.sep) || '&'
            let eq = (opt && opt.eq) || '='
            let unescape = (opt && opt.unescape) || window.decodeURIComponent

            let data = {}
            // 去除部分没有的字符
            str.replace(/^[\s#?]+/, '')
                .split(sep)
                .forEach(function(item) {
                    if (!item) {
                        return
                    }
                    let arr = item.split(eq)
                    let key = arr[0]
                    if (key) {
                        let val = unescape(arr[1] || '')
                        if (data[key] === undefined) {
                            // 赋值
                            data[key] = val
                        } else if (data[key].push) {
                            // 多个相同字符
                            data[key].push(val)
                        } else {
                            // 值转化为数组
                            data[key] = [data[key], val]
                        }
                    }
                })
            return data
        },
        stringify: function(json, opt) {
            let sep = (opt && opt.sep) || '&'
            let eq = (opt && opt.eq) || '='
            let escape = (opt && opt.escape) || window.encodeURIComponent

            let arr = []
            forEach(json, function(item, n) {
                if (item == null) {
                    item = ''
                }
                let key = escape(n)
                if (item && item.constructor == Array) {
                    // 数组要转化为多个相同kv
                    item.forEach(function(one) {
                        arr.push(key + eq + escape(one))
                    })
                } else {
                    // 直接push
                    arr.push(key + eq + escape(item))
                }
            })
            return arr.join(sep)
        }
    }

    // ============================================================== 深度克隆
    function assign(target, ...objs) {
        forEach(objs, function(source) {
            forEach(source, function(item, n) {
                if (item) {
                    let type = toString.call(item).toLowerCase()
                    if (type == '[object date]') {
                        target[n] = new Date(item.getTime())
                        return
                    }
                    let targetType = toString.call(target[n]).toLowerCase()
                    if (type == '[object array]') {
                        if (targetType != type) {
                            target[n] = []
                        }
                        assign(target[n], item)
                        return
                    }
                    if (type == '[object object]') {
                        if (targetType != type) {
                            target[n] = {}
                        }
                        assign(target[n], item)
                        return
                    }
                }
                target[n] = item
            })
        })
        return target
    }

    // ========================================================================= 动态加载js
    // jsonp 加载方式需要使用
    let head = document.head || document.getElementsByTagName('head')[0] || document.documentElement
    function loadJS(url, callback) {
        // 创建节点
        let node = document.createElement('script')
        // 设置属性
        node.setAttribute('type', 'text/javascript')
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

    // ====================================================================== 获取页面唯一的 id 值
    // jsonp和禁止使用缓存中使用
    let soleTime = new Date().getTime() - 1000000
    let soleCount = 1000
    function getUUID() {
        soleCount
        soleCount += 1
        return Number(Math.round((Math.random() + 1) * 1000000) + (new Date().getTime() - soleTime) + '' + soleCount).toString(36)
    }

    // ===================================================================== 获得url的真实地址
    // 判断请求是否为跨域使用
    let linkA = document.createElement('a')
    function getFullUrl(url) {
        linkA.setAttribute('href', url)
        return linkA.href
    }

    // 安全获取子对象数据
    function getSafeData(data, property) {
        if (property && data) {
            property.split('.').forEach(function(item) {
                data = data[item]
                if (data == null) {
                    return false
                }
            })
        }
        return data
    }

    // ===================================================================== 参数整合url, 将多个URLSearchParams字符串合并为一个
    function fixedURL(url, paramStr) {
        if (paramStr) {
            return url + (url.indexOf('?') > -1 ? '&' : '?') + paramStr
        }
        return url
    }

    // ===================================================================== 参数转为 字符串
    function getParamString(param, dataType) {
        if (param instanceof window.FormData) {
            return param
        }
        if (!param || typeof param == 'string') {
            return param || ''
        }
        let str = dataType == 'json' ? JSON.stringify(param) : qs.stringify(param)
        return str
    }

    // ===================================================================== 获取默认的 Content-Type 的值
    function getDefaultContentType(dataType) {
        if (dataType == 'json') {
            return 'application/json'
        }
        return 'application/x-www-form-urlencoded'
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
        if (req.resType == 'json') {
            res.result = res.json
        }

        let date = res.getHeader('Date')
        if (date) {
            this.root.setDate(date)
        }

        delete this._req

        // 出发验证事件
        this.emit('verify', res)

        if (res.cancel === true) {
            // 验证事件中设置 res.cancel 为false，中断处理
            return
        }
        // callback事件，可以看做函数回调
        this.emit('callback', res)
    }

    // ==============================================jsonp==============================================
    function jsonpSend(res) {
        // req
        let req = res.withReq

        // 参数
        let param = req.param

        // callback
        let key = req.jsonpKey
        // jsonp回调字符串
        let backFunKey = param[key]
        if (!backFunKey) {
            // 没设置，自动设置一个
            param[key] = backFunKey = 'jsonp_' + getUUID()
        }

        // 控制，只出发一次回调
        let backFunFlag
        // 回调函数
        let backFun = data => {
            if (!backFunFlag) {
                backFunFlag = true
                // json数据
                res.json = data
                // json字符串
                res.text = ''
                // 错误，有data就正确的
                res.err = data ? null : 'http error'
                if (!req.outFlag) {
                    // outFlag 就中止
                    responseEnd.call(this, res)
                }
            }
        }

        // 设置默认的回调函数
        window[backFunKey] = backFun

        // 所有参数都放在url上
        let url = fixedURL(req.url, getParamString(param, req.dataType))

        // 发送事件出发
        this.emit('send', req)
        // 发送请求
        loadJS(url, function() {
            backFun()
        })
    }

    /**
     * fetch 发送数据
     */
    function fetchSend(res) {
        let req = res.withReq
        // 方法
        let method = String(req.method || 'GET').toUpperCase()

        // 参数
        let param = req.param

        // fetch option参数
        let option = {
            method: method,
            headers: req.header
        }

        // 提交字符串
        let paramStr = getParamString(param, req.dataType)

        if (method == 'GET') {
            req.url = fixedURL(req.url, paramStr)
            option.body = param = null
        } else {
            option.body = paramStr || null
            if (req.header['Content-Type'] === undefined && !req.isFormData) {
                // 默认 Content-Type
                req.header['Content-Type'] = getDefaultContentType(req.dataType)
            }
        }

        if (req.header['X-Requested-With'] === undefined && !req.isCross) {
            // 跨域不增加 X-Requested-With
            req.header['X-Requested-With'] = 'XMLHttpRequest'
        }

        if (req.isCross) {
            // 跨域
            option.mode = 'cors'
            if (req.withCredentials) {
                // 发送请求，带上cookie
                option.credentials = 'include'
            }
        } else {
            // 同域，默认带上cookie
            option.credentials = 'same-origin'
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
                // console.log("response.headers", response.headers)
                // 获取header
                res.getHeader = function(key) {
                    try {
                        return response.headers.get(key)
                    } catch (e) {
                        return ''
                    }
                }

                // 状态吗
                res.status = response.status
                // 返回的字符串
                res.text = ''
                // 是否有错误
                res.err = response.ok ? null : 'http error [' + res.status + ']'
                let results = ['', null]
                try {
                    results[0] = response.text()
                } catch (e) {}

                if (['json', 'text'].indexOf(req.resType) < 0) {
                    try {
                        results[1] = response[req.resType]()
                    } catch (e) {}
                }

                Promise.all(results).then(fetchData, fetchData)
            }
            delete req.outFlag
        }

        // 发送事件处理
        this.emit('send', req)
        // 发送数据
        window.fetch(req.url, option).then(fetchBack, fetchBack)
    }

    //创建XHR，兼容各个浏览器
    function createXHR() {
        return new window.XMLHttpRequest()
    }
    // xhr的onload事件
    function onload(res) {
        let req = res.withReq
        let xhr = req.xhr
        // req.outFlag 为true 表示，本次ajax已经中止，无需处理
        if (xhr && !req.outFlag) {
            let headers = ''
            try {
                // 获取所有可以的的header值（字符串）
                headers = xhr.getAllResponseHeaders()
            } catch (e) {}

            // 获取某个headers中的值
            res.headers = {
                get(key) {
                    return new RegExp('(?:' + key + '):[ \t]*([^\r\n]*)\r').test(headers) ? RegExp['$1'] : ''
                }
            }

            res.text = ''
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
            res.err = (s >= 200 && s < 300) || s === 304 || s === 1223 ? null : 'http error [' + s + ']'
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
    function xhrSend(res) {
        let req = res.withReq
        // XHR
        req.xhr = createXHR(req.isCross)

        // xhr 请求方法
        let method = String(req.method || 'GET').toUpperCase()

        if (req.withCredentials) {
            // xhr 跨域带cookie
            req.xhr.withCredentials = true
        }

        let paramStr = getParamString(req.param, req.dataType)

        if (method == 'GET') {
            // get 方法，参数都组合到 url上面
            req.xhr.open(method, fixedURL(req.url, paramStr), true)
            paramStr = null
        } else {
            req.xhr.open(method, req.url, true)
            if (req.header['Content-Type'] === undefined && !req.isFormData) {
                // Content-Type 默认值
                req.header['Content-Type'] = getDefaultContentType(req.dataType)
            }
        }
        if (req.header['X-Requested-With'] === undefined && !req.isCross) {
            // 跨域不增加 X-Requested-With 如果增加，容易出现问题，需要可以通过 事件设置
            req.header['X-Requested-With'] = 'XMLHttpRequest'
        }

        // XDR 不能设置 header
        forEach(req.header, function(v, k) {
            req.xhr.setRequestHeader(k, v)
        })
        res.status = 0

        if (this.hasEvent('progress')) {
            // 跨域 加上 progress post请求导致 多发送一个 options 的请求
            // 只有有进度需求的任务,才加上
            try {
                req.xhr.upload.onprogress = () => {
                    this.emit('progress', event)
                }
            } catch (e) {}
        }

        //发送请求

        // onload事件
        req.xhr.onload = onload.bind(this, res)

        // 发送前出发send事件
        this.emit('send', req)

        if (['arrayBuffer', 'blob'].indexOf(req.resType) >= 0) {
            req.xhr.responseType = req.resType
        }

        // 发送请求，注意要替换
        if (paramStr) {
            // eslint-disable-next-line
            paramStr = paramStr.replace(/[\x00-\x08\x11-\x12\x14-\x20]/g, '*')
        }
        req.xhr.send(paramStr)
    }

    // res 原型方法
    let ajaxRes = {
        getDate() {
            return this.root.root.getDate()
        },
        getData(property, data) {
            if (data === undefined) {
                data = this[this.jsonKey || 'json']
            }

            return getSafeData(data, property)
        },
        getHeader(key) {
            let val = ''
            if (this.headers) {
                try {
                    val = this.headers.get(key)
                } catch (e) {}
            }

            return val
        }
    }

    // 发送数据整理
    function requestSend(param, req) {
        // console.log("xxxx", param, req);
        if (req.outFlag) {
            // 已经中止
            return
        }

        // 方法
        req.method = String(req.method || 'get').toUpperCase()

        // callback中接收的 res
        let res = Object.create(ajaxRes)
        res.withReq = req
        res.root = this

        // 之前发出
        this.emit('before', req)

        req.path = ''
        req.orginURL = req.url
        // 短路径替换
        req.formatURL = req.orginURL
            // 自定义req属性
            .replace(/^<([\w,:]*)>/, function(s0, s1) {
                s1.split(/,+/).forEach(function(key) {
                    let [k1, k2] = key.toLowerCase().split(/:+/)
                    if (k2 === undefined) {
                        k2 = k1
                        k1 = 'method'
                    }
                    req[k1] = k2
                })
                return ''
            })
            // 短路经
            .replace(/^(\w+):(?!\/\/)/, (s0, s1) => {
                req.path = s0
                return req.paths[s1] || s0
            })

        if (req.baseURL && !/^(:?http(:?s)?:)?\/\//i.test(req.url)) {
            // 有baseURL 并且不是全量地址
            req.formatURL = req.baseURL + req.formatURL
        }

        // 确认短路径后
        this.emit('path', req)

        // 是否为 FormData
        let isFormData = false
        if (window.FormData && param instanceof window.FormData) {
            isFormData = true
        }
        req.isFormData = isFormData

        // 请求类型
        let dataType = (req.dataType = String(req.dataType || '').toLowerCase())

        if (isFormData) {
            // FormData 将参数都添加到 FormData中
            forEach(req.param, function(value, key) {
                if (param.has(key)) {
                    param.append(key, value)
                }
            })
            req.param = param
        } else {
            if (typeof param == 'string') {
                // 参数为字符串，自动格式化为 object，后面合并后在序列化
                param = dataType == 'json' ? JSON.parse(param) : qs.parse(param)
            }
            assign(req.param, param || {})
        }

        // 数据整理完成
        this.emit('open', req)

        // 还原,防止复写， 防止在 open中重写这些参数
        req.isFormData = isFormData
        req.dataType = dataType

        let method = String(req.method || 'get').toUpperCase()
        if (method == 'GET') {
            if (req.cache === false && !req.param._r_) {
                // 加随机数，去缓存
                req.param._r_ = getUUID()
            }
        }

        // 是否跨域, 获全路径后，比对
        req.isCross = !/:\/\/$/.test(getFullUrl(req.formatURL).split(host)[0] || '')

        req.url = req.formatURL
        if (method == 'JSONP') {
            // jsonp 获取数据
            jsonpSend.call(this, res)
            return
        }

        if (hasFetch && req.useFetch && !this.hasEvent('progress')) {
            //fetch 存在 fetch 并且无上传或者进度回调 只能异步
            fetchSend.call(this, res)
            return
        }

        // 走 XMLHttpRequest
        xhrSend.call(this, res)
    }

    function getConf({ baseURL, paths, useFetch, url, method, dataType, resType, param = {}, header = {}, jsonpKey, cache, withCredentials } = {}, val = {}) {
        if (baseURL) {
            val.baseURL = baseURL
        }

        if (paths) {
            val.paths = paths
        }

        if (typeof useFetch == 'boolean') {
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

        if (typeof cache == 'boolean') {
            val.cache = cache
        }

        if (typeof withCredentials == 'boolean') {
            val.withCredentials = withCredentials
        }
        return val
    }

    // 设置请求参数
    let theGlobal = {
        conf: {
            useFetch: true,
            resType: 'json',
            jsonpKey: 'callback',
            cache: true
        },
        events: {},
        on: onEvent,
        off: offEvent,
        setConf(opt = {}) {
            getConf(opt, theGlobal.conf)
        }
    }

    // 中止
    function ajaxAbort(flag) {
        let req = this._req
        if (req) {
            // 设置outFlag，会中止回调函数的回调
            req.outFlag = true
            if (req.xhr) {
                // xhr 可以原声支持 中止
                req.xhr.abort()
                req.xhr = null
            }
            delete this._req
            flag && this.emit('abort', req)
        }
    }

    // Ajax基础类
    class Ajax {
        // 初始化
        constructor(parent, opt) {
            this.root = parent
            this.events = {}
            this.conf = assign({}, theGlobal.conf, parent.conf, getConf(opt))
        }

        // 设置参数
        setConf(opt = {}) {
            getConf(opt, this.conf)
            return this
        }

        // 扩展
        assign(...args) {
            if (typeof args[0] === 'string') {
                this.assign({ [args[0]]: args[1] })
            } else {
                args.unshift(this)
                assign.apply(Object, args)
            }
            return this
        }

        // 中止 请求
        abort() {
            ajaxAbort.call(this, true)
            return this
        }

        // 超时
        timeout(time, callback) {
            setTimeout(() => {
                let req = this._req
                if (req) {
                    // 超时 设置中止
                    ajaxAbort.call(this)
                    // 出发超时事件
                    this.emit('timeout', req)
                }
            }, time)
            callback && this.on('timeout', callback)
            return this
        }

        // 发送数据， over 代表 是否要覆盖本次请求
        send(param, over) {
            if (this._req) {
                // 存在 _req
                if (!over) {
                    // 不覆盖，取消本次发送
                    return this
                }
                // 中止当前的
                this.abort()
            }

            // 制造 req
            let req = {}
            req.root = this
            this._req = req
            // 异步，settime 部分参数可以后置设置生效
            setTimeout(() => {
                assign(req, this.conf)
                requestSend.call(this, param || {}, req)
            }, 1)
            return this
        }

        // 返回Promist
        then(thenFn) {
            let pse = new Promise((resolve, reject) => {
                this.on('callback', function(res) {
                    resolve(res)
                })
                this.on('timeout', function() {
                    reject({ err: '访问超时', errType: 1 })
                })
                this.on('abort', function() {
                    reject({ err: '访问中止', errType: 2 })
                })
            })

            return (thenFn && pse.then(thenFn)) || pse
        }

        //
        emit(type, ...args) {
            // 全局事件
            emitEvent(theGlobal.events[type], this, args)
            // 当前分组事件
            emitEvent(this.root.events[type], this, args)
            // 当前ajax事件
            emitEvent(this.events[type], this, args)
            return this
        }

        hasEvent(type) {
            let evs = this.events[type]
            if (evs && evs.length > 0) {
                return true
            }
            evs = this.root.events[type]
            return (evs && evs.length > 0) || false
        }
    }

    Ajax.prototype.on = onEvent
    Ajax.prototype.off = offEvent

    let ajaxDateDiff = 0
    // ======================================================
    // ajax群组
    function newGroup(opt) {
        // 服务器时间差
        this.dateDiff = ajaxDateDiff
        // 分组默认配置项
        this.conf = {}
        // 分区事件
        this.events = {}
        opt && this.setConf(opt)
    }
    function load(url, callback, param, onNew) {
        let opt = url
        if (typeof url == 'string') {
            opt = {
                url: url
            }
        }

        if (callback && typeof callback != 'function') {
            param = callback
            callback = null
        }

        let one = new Ajax(this, opt)
        onNew && onNew(one)
        callback && one.on('callback', callback)
        one.send(param)
        return one
    }
    class AjaxGroup {
        // paths 为短路径
        constructor(opt) {
            newGroup.call(this, opt)
        }

        static create(fn) {
            if (!fn) {
                fn = function(...arg) {
                    return fn.load(...arg)
                }
            }
            Object.setPrototypeOf(fn, AjaxGroup.prototype)
            newGroup.call(fn)
            return fn
        }

        // 设置默认
        setConf(opt = {}) {
            getConf(opt, this.conf)
            return this
        }

        // 创建一个ajax
        create(opt) {
            return new Ajax(this, opt)
        }

        // 快捷函数
        shortcut(opt, events) {
            return (callback, param) => {
                return load.call(this, opt, callback, param, function(one) {
                    if (events) {
                        if (typeof events == 'function') {
                            one.on('callback', events)
                            return
                        }
                        for (let n in events) {
                            if (hasOwnProperty.call(events, n)) {
                                one.on(n, events[n])
                            }
                        }
                    }
                })
            }
        }

        // 创建并加载
        load(url, callback, param) {
            return load.call(this, url, callback, param)
        }

        // promise
        fetch(opt) {
            return this.create(opt)
                .send()
                .then()
        }

        setDate(date) {
            if (typeof date == 'string') {
                date = new Date(date.replace(/T/, ' ').replace(/\.\d+$/, ''))
            }
            if (date && date.getTime()) {
                this.dateDiff = ajaxDateDiff = date.getTime() - new Date().getTime()
            }
        }

        // 获取 服务器时间
        getDate() {
            return new Date(this.dateDiff + new Date().getTime())
        }
    }

    AjaxGroup.prototype.on = onEvent
    AjaxGroup.prototype.off = offEvent

    // 用于生成快捷方法
    function shortcut(type) {
        return (AjaxGroup.prototype[type] = function() {
            return this.load.apply(this, arguments).setConf({ method: type })
        })
    }

    shortcut('get')
    shortcut('post')
    shortcut('put')
    shortcut('jsonp')

    // 一个分组
    let val = AjaxGroup.create()
    // 全局
    val.global = theGlobal
    // 分组类
    val.Request = AjaxGroup
    // 其他util函数
    val.util = {
        assign,
        forEach,
        qs,
        loadJS,
        getUUID,
        getFullUrl,
        getSafeData
    }

    return val
})
