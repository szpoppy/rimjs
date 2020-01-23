import Vue, { VueConstructor, ComponentOptions } from "vue"

const _hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

// 插件模式 存储
let pluginArr: Function[] = []
/**
 * 插件注册
 * @param initFn
 */
export function vueFnOn(initFn: Function): void {
    pluginArr.push(initFn)
}
/**
 * 获取安全数据
 * @param key
 * @param opt
 */
function getSafe(key: string, opt: any): any {
    if (opt === undefined) {
        opt = this
    }
    let arr = key.split(".")
    for (let i = 0; i < arr.length; i += 1) {
        opt = opt[arr[i]]
        if (opt == null) {
            break
        }
    }

    return opt
}

interface anyObj {
    [propName: string]: any
}

/**
 * Vue 数据整合
 * @param data1
 * @param data2
 * @param vm
 */
function assignData(data1: Vue | anyObj, data2: anyObj, vm?: Vue): void {
    if (!vm) {
        if (data1.$set) {
            vm = data1 as Vue
        }
    }
    for (let n in data2) {
        if (_hasOwnProperty.call(data2, n)) {
            if (vm && data1[n] == undefined && vm != data1) {
                vm.$set(data1, n, data2[n])
                continue
            }
            let type1 = _toString.call(data1[n]).toLowerCase()
            let type2 = _toString.call(data2[n]).toLowerCase()
            if (type1 == type2 && type2 == "[object object]") {
                assignData(data1[n], data2[n], vm)
                continue
            }

            data1[n] = data2[n]
        }
    }
}

/**
 * vue install 函数
 * @param vue
 * @param initFn
 */
export function vueFnInstall(vue: VueConstructor, initFn: Function) {
    if (initFn) {
        vueFnOn(initFn)
    }
}

// 错误提示
const msgOpt = {
    before: "vue已经初始化，请在初始化之前调用"
}
function warn(key: string = "", msg: string = "before") {
    console.warn(key, msgOpt[msg] || msg || "")
}

interface fnObj {
    [propName: string]: Function
}
interface fnObjArr {
    [propName: string]: Function[]
}
interface bindFn extends Function {
    __$ext?: boolean
}
interface bindFnObj {
    [propName: string]: bindFn
}
/**
 * 绑定方法的第一个参数
 * @param fn
 */
function $bind(fn: Function | fnObj | Function[]): Function | fnObj | Function[] | any {
    if (typeof fn == "function") {
        let bind: bindFn = function(...args: any) {
            args.unshift(getExt(this))
            // console.log("bind", this, getExt(this), args)
            return fn.apply(this, args)
        }
        bind.__$ext = true
        return bind
    }

    let type = _toString.call(fn).toLowerCase()
    if (type == "[object object]") {
        let back = {}
        for (let n in fn) {
            back[n] = $bind(fn[n])
        }
        return back
    }

    if (type == "[object array]") {
        let back = []
        for (let i = 0; i < fn.length; i += 1) {
            back[i] = $bind(fn[i])
        }
        return back
    }

    return fn
}

// 生命周期
function lifecycleExec(fns: Function[]): Function {
    return function(): void {
        for (let i = 0; i < fns.length; i += 1) {
            fns[i].apply(this, arguments)
        }
    }
}

function makeLifecycle(inits?: string[]) {
    let lifecycles: fnObjArr = {}
    if (inits) {
        inits.forEach(function(key) {
            lifecycles[key] = []
        })
    }
    let back = {
        get(): fnObjArr {
            return lifecycles
        },
        on(key: string | fnObj, fn?: boolean | Function, isBind: boolean = false): void {
            if (typeof key == "string") {
                let lc = lifecycles[key]
                if (!lc) {
                    lc = lifecycles[key] = []
                }
                lc.push(isBind ? $bind(fn as Function) : fn)
                return
            }
            for (let n in key) {
                back.on(n, key[n], fn as boolean)
            }

            return
        },
        make(opt: any = {}, exec: Function = lifecycleExec): any {
            for (let n in lifecycles) {
                let fn = exec(lifecycles[n])
                if (_toString.call(opt[n]).toLowerCase() == "[object array]") {
                    opt[n].push(fn)
                } else {
                    opt[n] = fn
                }
            }
            return opt
        },
        emit(vm: Vue, type: string, ...args: any): void {
            let fns = lifecycles[type] || []
            for (let i = 0; i < fns.length; i += 1) {
                fns[i].apply(vm, args)
            }
        },
        currying(key: string): Function {
            if (lifecycles[key] === undefined) {
                lifecycles[key] = []
            }
            return function(fn: Function, isBind?: boolean): void {
                back.on(key, fn, isBind)
            }
        },
        has(): boolean {
            for (let n in lifecycles) {
                return true
            }
            return false
        }
    }

    return back
}

interface extVal {
    vm?: Vue
    temp?: object
    [propName: string]: any
}

let exts: Map<Vue, extVal> = new Map()
function getExt(vm: Vue): extVal | null {
    return exts.get(vm) || null
}

function assignExt(vm: Vue, opt: any): extVal {
    if (typeof opt == "function") {
        return function(...args): any {
            // args.unshift(getExt(vm))
            return opt.apply(vm, args)
        }
    }
    let type = _toString.call(opt).toLowerCase()
    if (type == "[object object]") {
        let back = {}
        for (let n in opt) {
            back[n] = assignExt(vm, opt[n])
        }
        return back
    }

    if (type == "[object array]") {
        let back = []
        for (let i = 0; i < opt.length; i += 1) {
            back[i] = assignExt(vm, opt[i])
        }
        return back
    }
    return opt
}

function setExt(vm: Vue, opt: any): void {
    // debugger
    let data = Object.assign({}, opt)
    let temp = data.temp
    delete data.temp
    let ext: extVal = assignExt(vm, opt)
    ext.vm = vm
    ext.temp = temp
    exts.set(vm, ext)
}

function removeExt(vm: Vue) {
    let data: extVal = getExt(vm)
    if (!data) {
        return
    }

    let temp = data.temp
    if (temp) {
        for (let n in temp) {
            if (/^\$T\$/.test(n)) {
                clearTimeout(temp[n])
                temp[n] = -1
                continue
            }
            if (/^\$I\$/.test(n)) {
                clearInterval(temp[n])
                temp[n] = -1
                continue
            }

            temp[n] = undefined
            delete temp[n]
        }
    }

    exts.delete(vm)
}

interface execOptions extends ComponentOptions<Vue> {
    [propName: string]: any
}

interface exportFn extends Function {
    options?: execOptions
}

export interface fnArgs {
    // 通用
    $set: Function
    $name: Function
    $mixins: Function
    $components: Function
    $directives: Function

    // 参数
    $props: Function
    $data: Function
    $setup: Function
    $computed: Function
    $filters: Function
    $model: Function
    $watch: Function
    $methods: Function

    $lifecycle: Function
    $created: Function
    $mounted: Function
    $destroyed: Function

    $nextTick: Function
    $emit: Function

    $: Function
    $getExt: Function
    $setExt: Function

    $export?: exportFn
}

export function vueFn(initFn: Function): fnArgs | execOptions {
    let initFlag = false
    let options: anyObj = {}
    let merges: fnObj = {}

    // data 数据收集
    let optData = {}
    merges.data = function(val: anyObj) {
        assignData(optData, val)
    }

    // 官方函数式编程
    let optSetup = {}
    merges.setup = function(val: fnObj) {
        for (let n in val) {
            optSetup[n] = val[n]
        }
    }
    options.methods = {}
    merges.methods = function(key: string | bindFnObj, val?: bindFn) {
        let methodObj: bindFnObj = typeof key == "function" ? { [key]: val } : (key as bindFnObj)
        let m = options.methods
        for (let n in methodObj) {
            let fn = methodObj[n]
            let key = n
            if (!fn.__$ext) {
                key = n.replace(/^:/, function() {
                    fn = $bind(fn)
                    return ""
                })
            }
            m[key] = fn as Function
        }
    }

    // mixins
    options.mixins = []

    function $set(prot?: string | execOptions, val?: any): execOptions {
        if (initFlag) {
            warn("[$set]")
            return
        }
        if (!prot) {
            return options
        }

        let opt: execOptions = typeof prot == "string" ? { [prot]: val } : prot

        for (let n in opt) {
            let fn = merges[n]
            if (fn) {
                fn(opt[n])
                continue
            }

            let oVal = options[n]
            let oType = _toString.call(oVal).toLowerCase()
            if (oVal) {
                if (oType == "[object object]") {
                    assignData(options[n], opt[n])
                    continue
                }
                if (oType == "[object array]") {
                    if (_toString.call(opt[n]).toLowerCase() == "[object array]") {
                        oVal.push(...opt[n])
                    } else {
                        oVal.push(opt[n])
                    }

                    continue
                }
            }

            options[n] = opt[n]
        }

        return options
    }

    function quickSet(prot: string, formatFn?: Function): Function {
        if (formatFn) {
            merges[prot] = formatFn
        }
        return function(key: string | any, val?: any): void {
            let data = val !== undefined && typeof key === "string" ? { [key]: val } : key
            $set(prot, data)
        }
    }

    let lifecycle = makeLifecycle()

    interface nextDoItem extends Array<any> {
        [0]: string
        [1]: any
    }

    // the Next
    let nextDoArr: nextDoItem[] = []
    function quickNext(key: string) {
        return function(...args: any): void {
            if (initFlag) {
                warn("[" + key + "]")
                return
            }
            nextDoArr.push([key, args])
        }
    }

    let nextDoBind: string = "mounted"
    function quickNextExec(): void {
        lifecycle.on(nextDoBind, function() {
            nextDoArr.forEach(([key, args]) => {
                this[key](...args)
            })
        })
    }

    let extData = {
        get(key: string): any {
            return getSafe(key, this as Vue)
        },
        set(key: string, val: any) {
            let self = this as Vue
            if (typeof key === "string") {
                let k
                let pre = key.replace(/\.(.+?)$/, function(s0, s1) {
                    k = s1
                    return ""
                })
                if (!k) {
                    self[key] = val
                    return
                }
                let data = getSafe(pre, self)
                // console.log("-------------", data, this.touch, pre)
                if (!data) {
                    return
                }
                if (data[k] === undefined) {
                    self.$set(data, k, val)
                    return
                }
                data[k] = val
                return
            }
            assignData(self, key)
        },
        temp: {}
    }

    let fnArg: fnArgs = {
        // 通用
        $set,
        $name: quickSet("name"),
        $mixins: quickSet("mixins"),
        $components: quickSet("components"),
        $directives: quickSet("directives"),

        // 参数
        $props: quickSet("props"),
        $data(key: string | anyObj, val: Vue | any, vm?: Vue): void {
            let opt: anyObj
            if (typeof key == "string") {
                opt = { [key]: val }
            } else {
                opt = key
                vm = val as Vue
            }
            assignData(vm || optData, opt)
        },
        $setup(key: string | anyObj, val: any): void {
            if (val !== undefined) {
                optSetup[key as string] = val
                return
            }
            for (let n in key as anyObj) {
                optSetup[n] = key[n]
            }
        },
        $computed: quickSet("computed"),
        $filters: quickSet("filters"),
        $model: quickSet("model"),
        $watch: quickSet("watch"),
        $methods: quickSet("methods"),

        $lifecycle: lifecycle.on,
        $created: lifecycle.currying("created"),
        $mounted: lifecycle.currying("mounted"),
        $destroyed: lifecycle.currying("destroyed"),

        $nextTick: quickNext("$nextTick"),
        $emit: quickNext("$emit"),

        $: $bind,
        $getExt: getExt,
        $setExt(key: string | anyObj, val?: any): void {
            let opt = typeof key == "string" ? { [key]: val } : val
            assignData(extData, opt)
        }
    }

    lifecycle.on("beforeCreate", function() {
        // console.log("beforeC", this)
        setExt(this, extData)
    })

    let afterArr: Function[] = []
    pluginArr.forEach(function(pluginFn) {
        pluginFn({
            after(afterFn: Function) {
                afterArr.push(afterFn)
            },
            fnArg,
            lifecycle,
            makeLifecycle,
            quickSet,
            quickNext,
            setQuickNextExec(key: string) {
                nextDoBind = key
            },
            merges,
            extData
        })
    })

    function output(): execOptions {
        if (initFlag) {
            // 防止多次执行
            return
        }
        afterArr.forEach(function(afterFn) {
            afterFn(fnArg)
        })

        // 快捷 执行方式
        quickNextExec()

        options.data = function() {
            return optData
        }
        options.setup = function() {
            return optSetup
        }

        lifecycle.make(options)

        lifecycle.on("destroyed", function() {
            // console.log("destroyed", this)
            removeExt(this)
        })

        initFlag = true
        // console.log("[options]", options)
        // fn && fn(options)
        // console.log("[options]", options, optData, optSetup)
        return options
    }

    if (!initFn) {
        interface eptFn extends Function {
            options?: execOptions
        }
        // output.options = options
        fnArg.$export = function(resolve?: Function, reject?: Function) {
            if (resolve) {
                if (reject) {
                    output()
                    resolve(options)
                    return
                }
                // 异步模式
                let ept: eptFn = function(fn: Function) {
                    resolve(function() {
                        output()
                        fn(options)
                    })
                }
                ept.options = options
                return ept
            }
            output()
            return options
        }
        fnArg.$export.options = options
        return fnArg
    }

    initFn && initFn(fnArg)

    return output()
}

vueFn.on = vueFnOn
vueFn.install = vueFnInstall

export default vueFn
