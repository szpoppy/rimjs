/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */

// eslint-disable-next-line
import Vue, { VueConstructor } from "vue"
import { App } from "vue3" // vue3

interface vueUnicomGather {
    [propName: string]: VueUnicom // 任意类型
}
// #id 存放id的unicom对象
let unicomGroupByID: vueUnicomGather = {}
/**
 * 寄存target(vm)
 * @param target
 * @param newId
 * @param oldId
 */
function updateUnicomGroupByID(target: VueUnicom, newId: string, oldId: string): void {
    // 更新 id 触发更新
    if (oldId && unicomGroupByID[oldId] == target) {
        delete unicomGroupByID[oldId]
    }
    if (newId) {
        unicomGroupByID[newId] = target
    }
}

interface vueUnicomGatherName {
    [propName: string]: Array<VueUnicom> // 任意类型
}
// @name 存放name的数组对象
let unicomGroupByName: vueUnicomGatherName = {}
/**
 * 通过name存放 target(vm)
 * @param target
 * @param name
 */
function addUnicomGroupByNameOne(target: VueUnicom, name: string): void {
    // 加入一个name
    let unicoms = unicomGroupByName[name]
    if (!unicoms) {
        unicoms = unicomGroupByName[name] = []
    }
    if (unicoms.indexOf(target) < 0) {
        unicoms.push(target)
    }
}

/**
 * 更新unicom name命名
 * @param target
 * @param newName
 * @param oldNamegroup
 */
function updateUnicomGroupByName(target: VueUnicom, newName: Array<string>, oldName: Array<string>) {
    // 某个unicom对象更新 name
    if (oldName) {
        // 移除所有旧的
        oldName.forEach(function(name) {
            let unicoms = unicomGroupByName[name]
            if (unicoms) {
                let index = unicoms.indexOf(target)
                if (index > -1) {
                    unicoms.splice(index, 1)
                }
            }
        })
    }

    if (newName) {
        // 加入新的
        newName.forEach(function(name) {
            addUnicomGroupByNameOne(target, name)
        })
    }
}

// @all 所有的unicom对象集合，发布指令是待用
let unicomGroup: Array<VueUnicom> = []
function addUnicomGroup(target: VueUnicom): void {
    // 添加
    unicomGroup.push(target)
}
function removeUnicomGroup(target: VueUnicom): void {
    // 移除
    let index = unicomGroup.indexOf(target)
    if (index > -1) {
        unicomGroup.splice(index, 1)
    }
}

// 发布指令时产生的事件的类
export class VueUnicomEvent<D = any, T = any> {
    from: any
    target: T
    data: D;
    [propName: string]: any
    constructor(from: any, args: Array<any>) {
        // 来自
        this.from = from || null
        // 目标绑定的对象，vue中代表vue的实例
        this.target = (from && from.target) || null
        // 第一号数据
        this.data = args[0]
        // 多个数据 使用 $index 表示
        args.forEach((arg, index) => {
            this["$" + (index + 1)] = arg
        })
    }
}

export type VueUnicomEmitBack<D, T = any> = VueUnicomEvent<D, T> | VueUnicom | VueUnicom[]

function _unicomEmit<D, T extends Vue = Vue>(self: T, query: string, data?: D, args: any[] = []): VueUnicomEmitBack<D, T> {
    // 以下是全局触发发布
    let type: string = ""
    let target: string = ""
    let instruct: string = ""
    instruct = query.replace(/([@#])([^@#]*)$/, function(s0, s1, s2) {
        target = s2
        type = s1
        return ""
    })

    let targetUnicom: Array<VueUnicom> = []
    if (type == "#") {
        // 目标唯一
        let one = unicomGroupByID[target]
        if (!instruct) {
            // 只是获取
            return one
        }
        if (one) {
            targetUnicom.push(one)
        }
    } else if (type == "@") {
        // 目标是个分组
        let group = unicomGroupByName[target]
        if (!instruct) {
            // 只是获取
            return group
        }
        if (group) {
            targetUnicom.push(...group)
        }
    } else {
        targetUnicom.push(...unicomGroup)
    }
    args.unshift(data)
    let uniEvent = new VueUnicomEvent<D, T>(self, args)
    targetUnicom.forEach(function(emit) {
        // 每个都触发一遍
        emit.emit<VueUnicomEvent>(instruct, uniEvent)
    })
    return uniEvent
}

export function unicomEmit<D>(query: string, data?: D, ...args: any): VueUnicomEmitBack<D, any> {
    return _unicomEmit<D, any>(null, query, data, args)
}

// 监控数据
let monitorArr: Array<[string, string, Function, VueUnicom?]> = []
function monitorExec(that: VueUnicom) {
    for (let i = 0; i < monitorArr.length; i += 1) {
        let [type, target, callback] = monitorArr[i]
        if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
            // 运行监控回调
            callback(that)
        }
    }
}

export interface IVueUnicomArg {
    id?: string
    group?: string | Array<string>
    target?: any
}
interface vueUnicomInstruct {
    [propName: string]: Function[] // 任意类型
}

export interface IVueUnicomBackOption<T> {
    [propName: string]: <D>(arg: VueUnicomEvent<D, T>) => void
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        unicomId?: string
        unicomName?: string | string[]
        unicom?: IVueUnicomBackOption<V>
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $unicom: <D>(query: string, data?: D, ...args: any) => VueUnicomEmitBack<D, Vue | App>
        // eslint-disable-next-line
        _unicom_data_?: vueUnicomData
    }
}

declare module "vue" {
    // vue3
    interface ComponentCustomOptions {
        unicomId?: string
        unicomName?: string | string[]
        unicom?: IVueUnicomBackOption<Vue | App>
    }

    interface ComponentCustomProperties {
        $unicom: <D>(query: string, data?: D, ...args: any) => VueUnicomEmitBack<D, Vue | App>
        // eslint-disable-next-line
        _unicom_data_?: vueUnicomData
    }
}

// 通讯基础类
export class VueUnicom {
    static install = vueUnicomInstall
    // 事件存放
    protected _instruct_: vueUnicomInstruct = {}
    // 绑定目标 可以是vue的vm 也可以是任意
    target: any
    // 唯一的id
    id: string = ""
    // 属于的分组
    group: Array<string>

    static emit = unicomEmit

    // 私有属性
    // eslint-disable-next-line
    private _monitor_back_: null | ReturnType<typeof setTimeout> = null
    constructor({ id, group, target }: IVueUnicomArg = {}) {
        let _instruct_ = this._instruct_
        this._instruct_ = {}
        if (_instruct_) {
            // 克隆一份 事件
            // 通过 Unicom.prototype.on() 会把事件写入 Unicom.prototype._instruct_
            // 所以要重写，防止全局冲突
            for (let n in _instruct_) {
                let arr: Function[] = []
                arr.push(...(_instruct_[n] as Function[]))
                this._instruct_[n] = arr
            }
        }

        // 绑定的目标对象
        this.target = target

        // 分组
        this.group = []

        if (id) {
            this.setId(id)
        }

        if (group) {
            this.setGroup(group)
        }

        // 将实例加入到单例的队列
        addUnicomGroup(this)

        // 查找监控中是否被监控中
        this.monitorBack()
    }

    // 延迟合并执行
    monitorBack(): VueUnicom {
        clearTimeout(this._monitor_back_)
        // eslint-disable-next-line
        this._monitor_back_ = setTimeout(() => {
            monitorExec(this)
        }, 1)

        return this
    }

    // 监听目标创建
    monitor(instruct: string, callback: Function): VueUnicom {
        let type = instruct.slice(0, 1)
        let target = instruct.slice(1, instruct.length)
        monitorArr.push([type, target, callback, this])
        return this
    }

    // 销毁监听
    monitorOff(instruct?: string, callback?: Function): VueUnicom {
        for (let i = 0; i < monitorArr.length; ) {
            let [type, target, fn, self] = monitorArr[i]
            if (self == this && (!instruct || instruct == type + target) && (!callback || callback == fn)) {
                monitorArr.splice(i, 1)
                continue
            }

            i += 1
        }
        return this
    }

    // 销毁
    destroy(): void {
        // 销毁队列
        removeUnicomGroup(this)

        // 移除
        updateUnicomGroupByID(this, "", this.id)
        updateUnicomGroupByName(this, [], this.group)

        // 监控销毁
        this.monitorOff()

        // 订阅销毁
        this.off()
    }

    // 唯一标识
    setId(id: string): VueUnicom {
        if (this.id != id) {
            updateUnicomGroupByID(this, id, this.id)
            this.id = id

            // 运行延后执行
            this.monitorBack()
        }

        return this
    }

    // 分组
    setGroup(group: string | string[]) {
        if (typeof group == "string") {
            this.group.push(group)
            addUnicomGroupByNameOne(this, group)
            return this
        }

        // 重新更新
        updateUnicomGroupByName(this, group, this.group)
        this.group = group

        // 运行延后执行
        this.monitorBack()
        return this
    }

    has(type: string): boolean {
        let instruct: Function[] = (this._instruct_ || {})[type]
        return !!(instruct && instruct.length > 0)
    }

    // 订阅消息
    on<D = any, T = any>(type: string, fn: (arg: VueUnicomEvent<D, T>) => void): VueUnicom {
        let instruct = this._instruct_ || (this._instruct_ = {})
        instruct[type] || (instruct[type] = [])
        instruct[type].push(fn)
        return this
    }

    // 移除订阅
    off(type?: string, fn?: Function): VueUnicom {
        let instruct = this._instruct_
        if (instruct) {
            if (fn) {
                let es = instruct[type as string]
                if (es) {
                    let index = es.indexOf(fn)
                    if (index > -1) {
                        es.splice(index, 1)
                    }
                    if (es.length == 0) {
                        delete instruct[type as string]
                    }
                }
            } else if (type) {
                delete instruct[type]
            } else {
                delete this._instruct_
            }
        }
        return this
    }

    // 触发订阅
    emit<D>(query: string, data?: D, ...args: any): VueUnicomEmitBack<D> {
        if (data && data instanceof VueUnicomEvent) {
            // 只需要负责自己
            let es = (this._instruct_ && this._instruct_[query]) || []
            es.forEach(channelFn => {
                channelFn.call(this.target, data)
            })
            return data
        }

        // 以下是全局触发发布
        return _unicomEmit<D>(this.target, query, data, args)
    }
}

// vue 安装插槽
let unicomInstalled: boolean = false

// vue中指令
interface vueInstruct {
    [propName: string]: (arg: VueUnicomEvent) => void
}
// vue临时存储数据
interface vueUnicomData {
    isIgnore: boolean
    // 分组
    initGroup?: Array<string>
    // 指令
    instructs?: Array<vueInstruct>
    // 绑定的unicom对象
    unicom?: VueUnicom
}

export function vueUnicomInstall(V: VueConstructor | App, { useProps = true } = {}) {
    if (unicomInstalled) {
        // 防止重复install
        return
    }
    unicomInstalled = true

    let name = "unicom"

    function uniconExe(this: any, query: string, ...args: any) {
        return this._unicom_data_.unicom.emit(query, ...args)
    }

    let is3 = V.version.indexOf("3") == 0
    let destroyed = "destroyed"
    if (is3) {
        destroyed = "unmounted"
        let vA = V as App
        vA.config.globalProperties["$" + name] = uniconExe
    } else {
        // 添加原型方法
        let vV = V as VueConstructor
        vV.prototype["$" + name] = uniconExe
    }

    // unicom-id
    let unicomIdName = name + "Id"
    // 分组  unicom-name
    let unicomGroupName = name + "Name"

    // 组合分组
    function getGroup(target: any) {
        let unicomData = target._unicom_data_
        let names = target[unicomGroupName] || []
        return unicomData.initGroup.concat(names)
    }

    let mixin = {
        // 创建的时候，加入事件机制
        beforeCreate() {
            // 屏蔽不需要融合的 节点
            let isIgnore = !is3 && (!this.$vnode || /-transition$/.test(this.$vnode.tag as string))
            // unicomData 数据存放
            let unicomData: vueUnicomData = {
                // 不需要，忽略
                isIgnore
            }
            // eslint-disable-next-line
            this._unicom_data_ = unicomData
            if (isIgnore) {
                return
            }

            let opt: any = this.$options
            unicomData.initGroup = opt[unicomGroupName] || []
            unicomData.instructs = opt[name] || []

            // 触发器
            // unicomData.self = new Unicom({target: this})
        },
        created(this: any) {
            let unicomData = this._unicom_data_ as vueUnicomData
            if (unicomData.isIgnore) {
                // 忽略
                return
            }

            // 初始化
            let unicom = (unicomData.unicom = new VueUnicom({ target: this, id: this[unicomIdName], group: getGroup(this) }))

            // 订阅事件
            let instructs = unicomData.instructs || []
            instructs.forEach(function(subs) {
                for (let n in subs) {
                    unicom.on(n, subs[n] as any)
                }
            })
        },
        // 全局混合， 销毁实例的时候，销毁事件
        [destroyed](this: any) {
            let unicomData = this._unicom_data_ as vueUnicomData
            if (unicomData.isIgnore) {
                // 忽略
                return
            }
            // 销毁 unicom 对象
            let unicom = unicomData.unicom
            if (unicom) {
                unicom.destroy()
            }
        }
    }
    if (useProps) {
        Object.assign(mixin, {
            props: {
                // 命名
                [unicomIdName]: {
                    type: String,
                    default: ""
                },
                // 分组
                [unicomGroupName]: {
                    type: [String, Array],
                    default: ""
                }
            },
            watch: {
                [unicomIdName](nv: string) {
                    let ud = this._unicom_data_ as any
                    if (ud && ud.unicom) {
                        ud.unicom.setId(nv)
                    }
                },
                [unicomGroupName]() {
                    let ud = this._unicom_data_ as any
                    if (ud && ud.unicom) {
                        ud.unicom.setGroup(getGroup(this))
                    }
                }
            }
        })
    }

    // 全局混入 vue
    V.mixin(mixin)

    interface unicomInObj {
        [propName: string]: (arg: VueUnicomEvent) => VueUnicomEvent
    }

    // 自定义属性合并策略
    let merge = V.config.optionMergeStrategies
    merge[name] = function(parentVal?: unicomInObj[], childVal?: unicomInObj) {
        let arr = parentVal || []
        if (childVal) {
            arr.push(childVal)
        }
        return arr
    }
    merge[unicomGroupName] = function(parentVal?: string[], childVal?: string | string[]) {
        let arr = parentVal || []
        if (childVal) {
            if (typeof childVal == "string") {
                arr.push(childVal)
            } else {
                arr.push(...childVal)
            }
        }
        return arr
    }
}

export default VueUnicom
