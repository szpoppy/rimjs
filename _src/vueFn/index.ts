// eslint-disable-next-line
import Vue, { ComponentOptions, Component, AsyncComponent, DirectiveFunction, DirectiveOptions, PropOptions, ComputedOptions, WatchOptionsWithHandler, WatchHandler } from "vue"

const _hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

interface IAnyObj {
    [propName: string]: any
}

export interface IVueFnExtVal {
    vm: IVue
    temp: IAnyObj
    get: (key: string) => any
    set: (key: string | IAnyObj, val?: any) => void
    [propName: string]: any
}

interface IVue extends Vue {
    [propName: string]: any
}

interface IOnExportFn {
    (): void
}

export interface IVueFnPluginArg {
    onExport(fn: IOnExportFn): void
    lifecycle: any
    makeLifecycle: any
    quickSet: any
    merges: any
    extData: any
}

interface IModel {
    prop?: string
    event?: string
}

interface IOptions<T> {
    (key: string | Record<string, T>, val?: T): void
}

interface ILifecycle {
    (fn: (this: IVue, ext: IVueFnExtVal) => void, isExt: true): void
    (fn: (this: IVue) => void, isExt: false): void
    (fn: (this: IVue) => void): void
}

interface ILifecycleByKey {
    (key: string, fn: (this: IVue, ext: IVueFnExtVal) => void, isExt: true): void
    (key: string, fn: (this: IVue) => void, isExt: false): void
    (key: string, fn: (this: IVue) => void): void
}

type Accessors<T> = {
    [K in keyof T]: (() => T[K]) | ComputedOptions<T[K]>
}

export interface IVueFnArg {
    plugin: <T>(plug: (plug: IVueFnPluginArg, arg: IVueFnArg) => T) => T
    // 通用
    $set: (prot?: string | execOptions, val?: any) => execOptions | undefined
    $name: (name: string) => void
    $mixins: (mixin: ComponentOptions<Vue> | typeof Vue) => void
    $components: IOptions<Component<any, any, any, any> | AsyncComponent<any, any, any, any>>
    $directives: IOptions<DirectiveFunction | DirectiveOptions>

    // 参数
    $props: IOptions<PropOptions<any>>
    $data: IOptions<any>
    $setup: IOptions<any>
    $computed: IOptions<Accessors<{ [key: string]: any }>>
    // $computed: <T>(key: string | IComputedOptionsObj<T>, prop?: ComputedOptions<T>) => void
    $filters: IOptions<Function>
    $model: (model: IModel) => void
    $watch: IOptions<WatchOptionsWithHandler<any> | WatchHandler<any> | string>
    $methods: IOptions<(this: IVue, ...args: any[]) => any>

    $lifecycle: ILifecycleByKey
    $created: ILifecycle
    $mounted: ILifecycle
    $destroyed: ILifecycle

    $: (fn: IBindInFn | IBindInFnObj | IBindInFn[]) => IBindFn | IBindFnObj | IBindFn[]
    $getExt: (vm: IVue) => IVueFnExtVal | null
    $setExt: (key: string | IAnyObj, val?: any) => void

    $export: () => ComputedOptions<IVue>

    [propName: string]: any
}

interface IFnObj {
    [propName: string]: Function
}
interface IFnObjArr {
    [propName: string]: Function[]
}
interface IBindInFn {
    (ext: IVueFnExtVal, ...args: any[]): any
}
interface IBindInFnObj {
    [propName: string]: IBindInFn
}
interface IBindFn extends Function {
    __$ext?: boolean
}
interface IBindFnObj {
    [propName: string]: IBindFn
}

type bindxFn = IBindFn | IBindInFn
interface bindxFnObj {
    [propName: string]: bindxFn
}

/**
 * 获取安全数据
 * @param key
 * @param opt
 */
function getSafe(this: any, key: string, opt: any): any {
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

/**
 * Vue 数据整合
 * @param data1
 * @param data2
 * @param vm
 */
function assignData(data1: IVue | any, data2: any, vm?: IVue): void {
    if (!vm) {
        if (data1.$set) {
            vm = data1 as IVue
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

// 错误提示
const msgOpt: any = {
    before: "vue已经初始化，请在初始化之前调用"
}
function warn(key: string = "", msg: string = "before") {
    console.warn(key, msgOpt[msg] || msg || "")
}

/**
 * 绑定方法的第一个参数
 * @param fn
 */
function $bind(fn: IBindInFn | IBindInFnObj | IBindInFn[]): IBindFn | IBindFnObj | IBindFn[] {
    if (typeof fn == "function") {
        let bind: IBindFn = function(this: IVue, ...args: any) {
            args.unshift(getExt(this))
            // console.log("bind", this, getExt(this), args)
            return fn.apply(this, args)
        }
        bind.__$ext = true
        return bind
    }

    let type = _toString.call(fn).toLowerCase()
    if (type == "[object object]") {
        let back: IBindFnObj = {}
        let ofn = fn as IBindInFnObj
        for (let n in ofn) {
            back[n] = $bind(ofn[n]) as IBindFn
        }
        return back
    }

    if (type == "[object array]") {
        let back: IBindFn[] = []
        let fns = fn as IBindInFn[]
        for (let i = 0; i < fns.length; i += 1) {
            back[i] = $bind(fns[i]) as IBindInFn
        }
        return back
    }

    return fn
}

// 生命周期
function lifecycleExec(fns: Function[]): Function {
    return function(this: IVue): void {
        for (let i = 0; i < fns.length; i += 1) {
            fns[i].apply(this, arguments)
        }
    }
}

function makeLifecycle(inits?: string[]) {
    let lifecycles: IFnObjArr = {}
    if (inits) {
        inits.forEach(function(key) {
            lifecycles[key] = []
        })
    }
    let back = {
        get(): IFnObjArr {
            return lifecycles
        },
        on(key: string | IFnObj, fn?: boolean | IBindInFn | Function, isBind: boolean = false): void {
            if (typeof key == "string") {
                let lc = lifecycles[key]
                if (!lc) {
                    lc = lifecycles[key] = []
                }
                if (isBind === true) {
                    lc.push($bind(fn as IBindInFn) as Function)
                    return
                }
                lc.push(fn as Function)
                return
            }
            for (let n in key) {
                back.on(n, key[n], fn as boolean)
            }

            return
        },
        make(opt: any = {}, exec: (fns: Function[]) => void = lifecycleExec): any {
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
        emit(vm: IVue, type: string, ...args: any): void {
            let fns = lifecycles[type] || []
            for (let i = 0; i < fns.length; i += 1) {
                fns[i].apply(vm, args)
            }
        },
        currying(key: string): any {
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

let exts: Map<IVue, IVueFnExtVal> = new Map()
function getExt(vm: IVue): IVueFnExtVal | null {
    return exts.get(vm) || null
}

function assignExt(vm: IVue, opt: any): any {
    if (typeof opt == "function") {
        return function(...args: any): any {
            // args.unshift(getExt(vm))
            return opt.apply(vm, args)
        }
    }
    let type = _toString.call(opt).toLowerCase()
    if (type == "[object object]") {
        let back: any = {}
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

function setExt(vm: IVue, opt: IVueFnExtVal): void {
    // debugger
    let data = Object.assign({}, opt)
    let temp = data.temp
    delete data.temp
    let ext: IVueFnExtVal = assignExt(vm, opt)
    ext.vm = vm
    ext.temp = temp
    exts.set(vm, ext)
}

function removeExt(vm: IVue): void {
    let data: IVueFnExtVal | null = getExt(vm)
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

export function vueFn(): IVueFnArg {
    let initFlag = false
    let options: IAnyObj = {}
    let merges: IFnObj = {}

    // data 数据收集
    let optData = {}
    merges.data = function(val: object) {
        Object.assign(optData, val)
    }

    // 官方函数式编程
    let optSetup: any = {}
    merges.setup = function(val: IFnObj) {
        for (let n in val) {
            optSetup[n] = val[n]
        }
    }
    options.methods = {}
    merges.methods = function(key: string | bindxFnObj, val?: bindxFn) {
        let methodObj: bindxFnObj = {}
        if (typeof key == "function") {
            methodObj[key] = val as bindxFn
        } else {
            Object.assign(methodObj, key)
        }

        let m = options.methods
        for (let n in methodObj) {
            let fn: IBindFn = methodObj[n]
            let key = n.replace(/^:/, "")
            if (key != n && !fn.__$ext) {
                m[key] = $bind(fn as IBindInFn)
                break
            }
            m[key] = fn
        }
    }

    // mixins
    options.mixins = []

    function $set(prot?: string | execOptions, val?: any): execOptions | undefined {
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

    function quickSet(prot: string, formatFn?: Function): any {
        if (formatFn) {
            merges[prot] = formatFn
        }
        return function(key: string | any, val?: any): void {
            let data = val !== undefined && typeof key === "string" ? { [key]: val } : key
            $set(prot, data)
        }
    }

    let lifecycle = makeLifecycle()

    let extData: any = {
        get(key: string): any {
            return getSafe(key, this)
        },
        set(this: IVue, key: string, val?: any) {
            // let self = this as Vue
            if (typeof key === "string") {
                let k
                let pre = key.replace(/\.(.+?)$/, function(s0, s1) {
                    k = s1
                    return ""
                })
                if (!k) {
                    this[key] = val
                    return
                }
                let data = getSafe(pre, this)
                // console.log("-------------", data, this.touch, pre)
                if (!data) {
                    return
                }
                if (data[k] === undefined) {
                    this.$set(data, k, val)
                    return
                }
                data[k] = val
                return
            }
            assignData(this, key)
        },
        temp: {}
    }
    let onExports: (() => void)[] = []
    let pluginArg: IVueFnPluginArg = {
        onExport(fn) {
            onExports.push(fn)
        },
        lifecycle,
        makeLifecycle,
        quickSet,
        merges,
        extData
    }

    let fnArg: IVueFnArg = {
        plugin(plug) {
            return plug(pluginArg, fnArg)
        },
        // 通用
        $set,
        $name: quickSet("name"),
        $mixins: quickSet("mixins"),
        $components: quickSet("components"),
        $directives: quickSet("directives"),

        // 参数
        $props: quickSet("props"),
        $data(key: string | IAnyObj, val: IVue | any, vm?: IVue): void {
            let opt: IAnyObj
            if (typeof key == "string") {
                opt = { [key]: val }
            } else {
                opt = key
                vm = val as IVue
            }
            assignData(vm || optData, opt)
        },
        $setup(key: string | IAnyObj, val: any): void {
            if (val !== undefined) {
                optSetup[key as string] = val
                return
            }
            let keyObj = key as IAnyObj
            for (let n in keyObj) {
                optSetup[n] = keyObj[n]
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

        $: $bind,
        $getExt: getExt,
        $setExt(key: string | IAnyObj, val?: any): void {
            let opt = typeof key == "string" ? { [key]: val } : val
            assignData(extData, opt)
        },
        $export() {
            output()
            return options
        }
    }

    lifecycle.on("beforeCreate", function(this: IVue) {
        // console.log("beforeC", this)
        setExt(this, extData)
    })

    function output(): execOptions | null {
        if (initFlag) {
            // 防止多次执行
            return null
        }

        options.data = function() {
            return optData
        }
        options.setup = function() {
            return optSetup
        }

        lifecycle.on("destroyed", function(this: IVue) {
            // console.log("destroyed", this)
            removeExt(this)
        })

        while (onExports.length) {
            let fn = onExports.shift()
            fn && fn()
        }

        lifecycle.make(options)

        initFlag = true
        // console.log("[options]", options)
        // fn && fn(options)
        // console.log("[options]", options, optData, optSetup)
        return options
    }
    return fnArg
}

export default vueFn
