// eslint-disable-next-line
import { VueConstructor } from "vue"
import { App } from "vue3" // vue3
/**
 * 初始化传入参数
 */
export interface IVueLiveInitObj {
    // 初始化函数
    init: Function
    // 默认
    hookDef?: string
    // 周期函数绑定到原生钩子函数
    hooks?: object
    // prepose 同什么事件绑定
    prepose?: string
    // 参数
    args?: Array<any> | any
}
interface vueLiveHook {
    that: any
    ready: any
    data: any
    callback?: Function
}
export interface IVueLiveHookEvent<T = any> {
    data: T
    emit: (key: string, data: any) => void
    then: (fn: () => void) => void
}

export interface IVueLiveHookOptionFn {
    <T>(arg: IVueLiveHookEvent<T>): void
}
export interface IVueLiveHookOption {
    [propName: string]: IVueLiveHookOptionFn
}

export interface IVueLifeInitFnArg {
    emit<T>(key: string, data?: T): T | undefined
    hooks: {
        [propName: string]: string
    }
    vue: VueConstructor | App
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        life?: IVueLiveHookOption
    }
}

declare module "vue" {
    // vue3
    interface ComponentCustomOptions {
        life?: IVueLiveHookOption
    }
}

// 插件默认名称
let defName: string = "life"

// 所有绑定关系
let hooks: any = {}

// 默认绑定
let hookDef: string

// 所有的钩子参数
let hookLifes: any = {}
// emit产生的数据
let hookEmitData: any = {}
// 生成唯一ID
let lifeIndexNum: number = 100

/**
 * 获取that绑定的数据
 * @param that
 */
function getHookLife(that: any): vueLiveHook {
    let id: string = that._life_id_
    if (!id) {
        lifeIndexNum += 1
        id = "$" + lifeIndexNum.toString()
        // eslint-disable-next-line
        that._life_id_ = id
    }
    let life: vueLiveHook = hookLifes[id]
    if (!life) {
        let data: any = {}
        for (let n in hookEmitData) {
            data[n] = hookEmitData[n]
        }
        life = hookLifes[id] = {
            that: that,
            ready: {},
            data: data
        }
    }
    return life
}

/**
 * 获取数据中data对应的属性值
 * @param key
 * @param that
 */
function getHookEmitData(key: string, that: any): any {
    let data = that ? getHookLife(that).data : hookEmitData
    if (key) {
        return data[key]
    }
    return data
}

/**
 * 增加 hookLife 节点
 * @param that
 * @param vueLifeName
 */
function addHookLifes(that: any, vueLifeName: string): vueLiveHook {
    let life = getHookLife(that)
    life.ready[vueLifeName] = true
    if (vueLifeName == hookDef && life.callback) {
        // 事件中的then函数
        life.callback()
    }
    return life
}

/**
 * 整理触发的事件
 * @param life
 * @param key
 */
function hookEmitEvent(life: vueLiveHook, key: string): IVueLiveHookEvent {
    return {
        data: life.data[key],
        /**
         * 当前vm中触发新的事件
         * @param key
         * @param value
         */
        emit(key, data) {
            hookEmit(key, data, life.that)
        },
        /**
         * 加入到ready后执行
         * @param callback
         */
        then(callback?: Function) {
            if (life.ready[hookDef]) {
                callback && callback()
                return
            }
            life.callback = callback
        }
    }
}

function _hookExec(key: string, life: vueLiveHook, data?: any): void {
    if (!data) {
        return
    }
    let lifes = life.that.$options[defName] || []
    let hook = hooks[key] || hookDef
    if (!life.ready[hook]) {
        return
    }
    // console.log(key, "lifes", lifes)
    let lifeFn: Function
    for (let i = 0; i < lifes.length; i += 1) {
        lifeFn = lifes[i][key]
        if (lifeFn) {
            lifeFn.call(life.that, hookEmitEvent(life, key))
        }
    }
}

function hookEmit(key: string, data: any, that?: any) {
    let hookData = getHookEmitData("", that)
    hookData[key] = {
        data: data
    }
    if (that) {
        _hookExec(key, getHookLife(that), hookData[key])
        return
    }
    // console.log("hookLifes", hookLifes)
    for (let n in hookLifes) {
        _hookExec(key, hookLifes[n], hookData[key])
    }
}

export function vueLifeInstall(V: VueConstructor | App, init: Function | IVueLiveInitObj) {
    // 初始化函数
    if (typeof init == "function") {
        init = {
            init: init
        }
    }
    let initFn: Function = init.init
    // 设定在什么钩子函数中出发
    hookDef = init.hookDef || "mounted"

    hooks = init.hooks || {}
    // prepose
    if (!hooks.prepose) {
        hooks.prepose = "beforeCreate"
    }

    let initArgs: Array<any> = init.args == null ? [] : Object.prototype.toString.call(init.args).toLowerCase() != "[object array]" ? [init.args] : init.args

    function hookExecByVM(that: any, lifeName: string): void {
        let life = addHookLifes(that, lifeName)
        let lifes = that.$options[defName] || []
        let readys: any = {}
        for (let i = 0; i < lifes.length; i += 1) {
            for (let k in lifes[i]) {
                if (!readys[k] && (hooks[k] || hookDef) == lifeName) {
                    readys[k] = true
                    _hookExec(k, life, getHookEmitData(k, that))
                }
            }
        }
    }

    function hooksFn(key: string): Function {
        return function(this: Vue) {
            // console.log("$$++++", key, hooks)
            let life = (this.$options as any)[defName]
            if (life) {
                if (hooks.prepose == key) {
                    // prepose 触发 emit
                    hookEmit("prepose", {}, this)
                }
                hookExecByVM(this, key)
            }
        }
    }

    // console.log("mixinOpt", mixinOpt)
    V.config.optionMergeStrategies[defName] = function(pVal: any, nVal: any): Array<any> {
        let val = pVal instanceof Array ? pVal : pVal ? [pVal] : []
        if (nVal) {
            val.push(nVal)
        }
        // console.log(val)
        return val
    }

    if (initFn) {
        let arg: IVueLifeInitFnArg = {
            emit(key, data) {
                hookEmit(key, data)
                return data
            },
            hooks,
            vue: V
        }
        initFn(arg, ...initArgs)
    }

    let mixinOpt: any = {}
    for (let n in hooks) {
        if (!mixinOpt[hooks[n]]) {
            mixinOpt[hooks[n]] = hooksFn(hooks[n])
        }
    }
    if (!mixinOpt[hookDef]) {
        mixinOpt[hookDef] = hooksFn(hookDef)
    }

    // 销毁
    let destroyedFn = mixinOpt.destroyed
    mixinOpt.destroyed = function() {
        if (destroyedFn) {
            destroyedFn.call(this)
        }

        let life = this.$options[defName]
        if (life) {
            for (let n in hookLifes) {
                if (this == hookLifes[n].that) {
                    delete hookLifes[n]
                }
            }
        }
    }

    V.mixin(mixinOpt)
}

export default vueLifeInstall
