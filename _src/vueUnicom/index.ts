/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */

import Vue, { VueConstructor } from "vue"

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
export class VueUnicomEvent {
    from: any
    target: any
    data: any;
    [propName: string]: any
    constructor(from: any, args: Array<any>) {
        // 来自
        this.from = from
        // 目标绑定的对象，vue中代表vue的实例
        this.target = from.target
        // 第一号数据
        this.data = args[0]
        // 多个数据 使用 $index 表示
        args.forEach((arg, index) => {
            this["$" + (index + 1)] = arg
        })
    }
}

// 发布事件
function emitAll(self: any, type: string, target: string, instruct: string, args: Array<any>): VueUnicomEvent | VueUnicom | Array<VueUnicom> {
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
    let uniEvent = new VueUnicomEvent(self, args)
    targetUnicom.forEach(function(emit) {
        // 每个都触发一遍
        emit.emit(instruct, uniEvent, ...args)
    })
    return uniEvent
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

export interface vueUnicomArg {
    id?: string
    group?: string | Array<string>
    target?: any
}
interface vueUnicomInstruct {
    [propName: string]: Array<Function> // 任意类型
}

// 通讯基础类
export class VueUnicom {
    static install: Function = vueUnicomInstall
    // 事件存放
    private _instruct_: vueUnicomInstruct = {}
    // 绑定目标 可以是vue的vm 也可以是任意
    target: any
    // 唯一的id
    id: string
    // 属于的分组
    group: Array<string>
    // 私有属性
    private _monitor_back_: number
    constructor({ id, group, target }: vueUnicomArg = {}) {
        let _instruct_ = this._instruct_
        this._instruct_ = {}
        if (_instruct_) {
            // 克隆一份 事件
            // 通过 Unicom.prototype.on() 会把事件写入 Unicom.prototype._instruct_
            // 所以要重写，防止全局冲突
            for (let n in _instruct_) {
                this._instruct_[n] = [].concat(_instruct_[n])
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
        updateUnicomGroupByID(this, null, this.id)
        updateUnicomGroupByName(this, null, this.group)

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
    on(type: string, fun: Function): VueUnicom {
        let instruct = this._instruct_ || (this._instruct_ = {})
        instruct[type] || (instruct[type] = [])
        instruct[type].push(fun)
        return this
    }

    // 移除订阅
    off(type?: string, fun?: Function): VueUnicom {
        let instruct = this._instruct_
        if (instruct) {
            if (fun) {
                let es = instruct[type]
                if (es) {
                    let index = es.indexOf(fun)
                    if (index > -1) {
                        es.splice(index, 1)
                    }
                    if (es.length == 0) {
                        delete instruct[type]
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
    emit(query: string, ...args: any): any {
        let data = args[0]
        if (data && data.constructor == VueUnicomEvent) {
            // 只需要负责自己
            let es = (this._instruct_ && this._instruct_[query]) || []
            es.forEach(channelFn => {
                channelFn.apply(this.target || this, args)
            })
            return data
        }

        // 以下是全局触发发布
        let type, target, instruct
        instruct = query.replace(/([@#])([^@#]*)$/, function(s0, s1, s2) {
            target = s2
            type = s1
            return ""
        })

        return emitAll(this, type, target, instruct, args)
    }
}

// vue 安装插槽
let unicomInstalled: boolean = false
// install 参数
export interface vueUnicomInstallArg {
    name?: string
    unicomName?: string
    unicomId?: string
    unicomEmit?: string
    unicomClass?: string
}

// vue中指令
interface vueInstruct {
    [propName: string]: Function
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
interface vueVM extends Vue {
    _unicom_data_: vueUnicomData
}
export function vueUnicomInstall(vue: VueConstructor, { name = "unicom", unicomName, unicomId, unicomEmit, unicomClass }: vueUnicomInstallArg = {}) {
    if (unicomInstalled) {
        // 防止重复install
        return
    }
    unicomInstalled = true

    // 添加原型方法
    let unicomEmitName = unicomEmit || name
    vue.prototype["$" + unicomEmitName] = function(query: string, ...args: any) {
        return this._unicom_data_.unicom.emit(query, ...args)
    }
    // 方便插件中引入
    let VueUnicomClassName = unicomClass
    if (!VueUnicomClassName) {
        VueUnicomClassName = name.replace(/^\w/, function(s0) {
            return s0.toUpperCase()
        })
    }
    vue[VueUnicomClassName] = VueUnicom

    // unicom-id
    let unicomIdName = unicomId || name + "Id"
    // 分组  unicom-name
    let unicomGroupName = unicomName || name + "Name"

    // 组合分组
    function getGroup(target: vueVM) {
        let unicomData = target._unicom_data_
        let names = target[unicomGroupName] || []
        return unicomData.initGroup.concat(names)
    }

    // 全局混入 vue
    vue.mixin({
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
            [unicomIdName](nv) {
                let self = this as vueVM
                let unicom = self._unicom_data_ && self._unicom_data_.unicom
                if (unicom) {
                    unicom.setId(nv)
                }
            },
            [unicomGroupName]() {
                let self = this as vueVM
                let unicom = self._unicom_data_ && self._unicom_data_.unicom
                if (unicom) {
                    unicom.setGroup(getGroup(self))
                }
            }
        },
        // 创建的时候，加入事件机制
        beforeCreate() {
            let self = this as vueVM
            // 屏蔽不需要融合的 节点
            let isIgnore = !self.$vnode || /-transition$/.test(self.$vnode.tag)
            // unicomData 数据存放
            let unicomData: vueUnicomData = {
                // 不需要，忽略
                isIgnore
            }
            self._unicom_data_ = unicomData
            if (isIgnore) {
                return
            }

            let opt = this.$options
            unicomData.initGroup = opt[unicomGroupName] || []
            unicomData.instructs = opt[name] || []

            // 触发器
            // unicomData.self = new Unicom({target: this})
        },
        created() {
            let self = this as vueVM
            let unicomData = self._unicom_data_
            if (unicomData.isIgnore) {
                // 忽略
                return
            }

            // 初始化
            let unicom = (unicomData.unicom = new VueUnicom({ target: self, id: self[unicomIdName], group: getGroup(self) }))

            // 订阅事件
            unicomData.instructs.forEach(function(subs) {
                for (let n in subs) {
                    unicom.on(n, subs[n])
                }
            })
        },
        // 全局混合， 销毁实例的时候，销毁事件
        destroyed() {
            let self = this as vueVM
            let unicomData = this._unicom_data_
            if (unicomData.isIgnore) {
                // 忽略
                return
            }
            // 销毁 unicom 对象
            unicomData.unicom.destroy()
        }
    })

    // 自定义属性合并策略
    let merge = vue.config.optionMergeStrategies
    merge[name] = function(parentVal, childVal) {
        let arr = parentVal || []
        if (childVal) {
            arr.push(childVal)
        }
        return arr
    }
    merge[unicomGroupName] = function(parentVal, childVal) {
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