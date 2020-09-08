/**
 * [2020-09-07] 开发
 */

// eslint-disable-next-line
import Vue, { VueConstructor } from "vue"

interface vueLakeGather {
    [propName: string]: VueLake // 任意类型
}
// #id 存放id的lake对象
let lakeGroupByID: vueLakeGather = {}
/**
 * 寄存target(vm)
 * @param target
 * @param newId
 * @param oldId
 */
function updateLakeGroupByID(target: VueLake, newId: string, oldId: string): void {
    // 更新 id 触发更新
    if (oldId && lakeGroupByID[oldId] == target) {
        delete lakeGroupByID[oldId]
    }
    if (newId) {
        lakeGroupByID[newId] = target
    }
}

interface vueLakeGatherName {
    [propName: string]: Array<VueLake> // 任意类型
}
// @name 存放name的数组对象
let lakeGroupByName: vueLakeGatherName = {}
/**
 * 通过name存放 target(vm)
 * @param target
 * @param name
 */
function addLakeGroupByNameOne(target: VueLake, name: string): void {
    // 加入一个name
    let lakes = lakeGroupByName[name]
    if (!lakes) {
        lakes = lakeGroupByName[name] = []
    }
    if (lakes.indexOf(target) < 0) {
        lakes.push(target)
    }
}

/**
 * 更新lake name命名
 * @param target
 * @param newName
 * @param oldNamegroup
 */
function updateLakeGroupByName(target: VueLake, newName: Array<string>, oldName: Array<string>) {
    // 某个lake对象更新 name
    if (oldName) {
        // 移除所有旧的
        oldName.forEach(function(name) {
            let lakes = lakeGroupByName[name]
            if (lakes) {
                let index = lakes.indexOf(target)
                if (index > -1) {
                    lakes.splice(index, 1)
                }
            }
        })
    }

    if (newName) {
        // 加入新的
        newName.forEach(function(name) {
            addLakeGroupByNameOne(target, name)
        })
    }
}

// @all 所有的lake对象集合，发布指令是待用
let lakeGroup: Array<VueLake> = []
function addLakeGroup(target: VueLake): void {
    // 添加
    lakeGroup.push(target)
}
function removeLakeGroup(target: VueLake): void {
    // 移除
    let index = lakeGroup.indexOf(target)
    if (index > -1) {
        lakeGroup.splice(index, 1)
    }
}

// 发布指令时产生的事件的类
export class VueLakeEvent<D = any> {
    from: any
    data: D;
    [propName: string]: any
    constructor(from: VueLake, data: D) {
        // 来自
        this.from = from
        // 数据
        this.data = data
    }
}

export type VueLakeEmitBack<D> = VueLakeEvent<D> | VueLake | VueLake[]

function getLake<D, T extends Vue = Vue>(query: string): [VueLake[], string] {
    // 以下是全局触发发布
    let type: string = ""
    let target: string = ""
    let instruct: string = ""
    instruct = query.replace(/([@#])([^@#]*)$/, function(s0, s1, s2) {
        target = s2
        type = s1
        return ""
    })

    let targetLake: Array<VueLake> = []
    if (type == "#") {
        // 目标唯一
        let one = lakeGroupByID[target]
        if (!instruct) {
            // 只是获取
            return [[one], ""]
        }
        if (one) {
            targetLake.push(one)
        }
    } else if (type == "@") {
        // 目标是个分组
        let group = lakeGroupByName[target]
        if (!instruct) {
            // 只是获取
            return [group, ""]
        }
        if (group) {
            targetLake.push(...group)
        }
    } else {
        targetLake.push(...lakeGroup)
    }

    return [targetLake, instruct]
}

// 异步触发
async function _lakePub<D>(self: VueLake, query: string, data?: D): Promise<VueLakeEmitBack<D>> {
    let [targetLake, instruct] = getLake(query)
    if (!instruct || targetLake instanceof VueLake) {
        return targetLake
    }
    if (data === undefined) {
        data = {} as any
    }
    let uniEvent = new VueLakeEvent<D>(self, data)
    let unis = targetLake.slice(0)
    let next = async function() {
        let un = unis.shift()
        if (un) {
            await un.pub<VueLakeEvent>(instruct, uniEvent)
            await next()
        }
    }
    await next()
    return uniEvent
}
export async function lakePub<D>(query: string, data?: D): Promise<VueLakeEmitBack<D>> {
    return await _lakePub<D>(null, query, data)
}

// 监控数据
let monitorArr: Array<[string, string, Function, VueLake?]> = []
function listenExec(that: VueLake) {
    for (let i = 0; i < monitorArr.length; i += 1) {
        let [type, target, callback] = monitorArr[i]
        if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
            // 运行监控回调
            callback(that)
        }
    }
}

export interface IVueLakeArg<T> {
    id?: string
    group?: string | Array<string>
    target?: T
}
interface vueLakeInstruct {
    [propName: string]: Function[] // 任意类型
}

export interface IVueLakeBackOption {
    [propName: string]: <V extends Vue, D>(this: V, arg: VueLakeEvent<D>, next: () => Promise<void>) => void
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        lakeId?: string
        lakeName?: string | string[]
        // esline-disable-next-line
        lakeSubs?: IVueLakeBackOption
    }
}

interface IVueLakeProt {
    <D>(query: string, data?: D): Promise<VueLakeEmitBack<D>>
    id(id: string): VueLake
    group(name: string): VueLake[]
}

let lakeProt = async function(query, data) {
    return await _lakePub(this, query, data)
} as IVueLakeProt

lakeProt.id = function(id) {
    return getLake("#" + id)[0][0]
}
lakeProt.group = function(name) {
    return getLake("@" + name)[0]
}

declare module "vue/types/vue" {
    interface Vue {
        $lake: IVueLakeProt
        _lake_data_?: vueLakeData
    }
}

// 通讯基础类
export class VueLake<T = any> {
    static install = vueLakeInstall
    // 事件存放
    protected _instruct_: vueLakeInstruct = {}
    // 绑定目标 可以是vue的vm 也可以是任意
    target: T | VueLake
    // 唯一的id
    id: string = ""
    // 属于的分组
    group: Array<string>

    static pub = lakePub
    static getId = lakeProt.id
    static getGroup = lakeProt.group

    // 私有属性
    // eslint-disable-next-line
    protected _monitor_back_: number = 0
    constructor({ id, group, target }: IVueLakeArg<T> = {}) {
        // 绑定的目标对象
        this.target = target === undefined ? this : target

        // 分组
        this.group = []

        if (id) {
            this.setId(id)
        }

        if (group) {
            this.setGroup(group)
        }

        // 将实例加入到单例的队列
        addLakeGroup(this)

        // 查找监控中是否被监控中
        this.listenExec()
    }

    // 延迟合并执行
    protected listenExec(): VueLake {
        clearTimeout(this._monitor_back_)
        // eslint-disable-next-line
        this._monitor_back_ = setTimeout(() => {
            listenExec(this)
        }, 1)

        return this
    }

    // 监听目标创建
    listen(instruct: string, callback: Function): VueLake {
        let type = instruct.slice(0, 1)
        let target = instruct.slice(1, instruct.length)
        monitorArr.push([type, target, callback, this])
        return this
    }

    // 销毁监听
    unListen(instruct?: string, callback?: Function): VueLake {
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
        removeLakeGroup(this)

        // 移除
        updateLakeGroupByID(this, "", this.id)
        updateLakeGroupByName(this, [], this.group)

        // 监控销毁
        this.unListen()

        // 订阅销毁
        this.unSub()
    }

    // 唯一标识
    setId(id: string): VueLake {
        if (this.id != id) {
            updateLakeGroupByID(this, id, this.id)
            this.id = id

            // 运行延后执行
            this.listenExec()
        }

        return this
    }

    // 分组
    setGroup(group: string | string[]) {
        if (typeof group == "string") {
            this.group.push(group)
            addLakeGroupByNameOne(this, group)
            return this
        }

        // 重新更新
        updateLakeGroupByName(this, group, this.group)
        this.group = group

        // 运行延后执行
        this.listenExec()
        return this
    }

    has(type: string): boolean {
        let instruct: Function[] = (this._instruct_ || {})[type]
        return !!(instruct && instruct.length > 0)
    }

    // 订阅消息
    sub<D = any>(type: string, fn: (arg: VueLakeEvent<D>, next: () => Promise<void>) => void): VueLake {
        let instruct = this._instruct_ || (this._instruct_ = {})
        instruct[type] || (instruct[type] = [])
        instruct[type].push(fn)
        return this
    }

    // 移除订阅
    unSub(type?: string, fn?: Function): VueLake {
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

    // 异步出发订阅
    async pub<D>(query: string, data?: D): Promise<VueLakeEmitBack<D>> {
        if (data && data instanceof VueLakeEvent) {
            // 只需要负责自己
            let es = ((this._instruct_ && this._instruct_[query]) || []).slice(0)
            let target = this.target
            let next = async function() {
                let channelFn = es.shift()
                let len = es.length
                if (channelFn) {
                    await channelFn.call(target, data, next)
                    if (len > 0 && len == es.length) {
                        // channelFn 内部没执行 next
                        await next()
                    }
                }
            }
            await next()
            return data
        }

        // 以下是全局触发发布
        return await _lakePub<D>(this, query, data)
    }
}

// vue 安装插槽
let lakeInstalled: boolean = false

// vue中指令
interface vueInstruct {
    [propName: string]: (arg: VueLakeEvent) => void
}
// vue临时存储数据
interface vueLakeData {
    isIgnore: boolean
    // 分组
    initGroup?: Array<string>
    // 指令
    instructs?: Array<vueInstruct>
    // 绑定的lake对象
    lake?: VueLake
}

export function vueLakeInstall(Vue: VueConstructor) {
    if (lakeInstalled) {
        // 防止重复install
        return
    }
    lakeInstalled = true

    let name: "lake" = "lake"

    // function(query: string, ...args: any) {
    //     return this._lake_data_.lake.emit(query, ...args)
    // }

    // 添加原型方法
    // Object.defineProperty(vue.prototype)
    Vue.prototype["$" + name] = lakeProt

    // lake-id
    let lakeIdName = name + "Id"
    // 分组  lake-name
    let lakeGroupName = name + "Name"

    // 组合分组
    function getGroup(target: any) {
        let lakeData = target._lake_data_
        let names = target[lakeGroupName] || []
        return lakeData.initGroup.concat(names)
    }

    // 全局混入 vue
    Vue.mixin({
        props: {
            // 命名
            [lakeIdName]: {
                type: String,
                default: ""
            },
            // 分组
            [lakeGroupName]: {
                type: [String, Array],
                default: ""
            }
        },
        watch: {
            [lakeIdName](nv) {
                let ud = this._lake_data_ as any
                if (ud && ud.lake) {
                    ud.lake.setId(nv)
                }
            },
            [lakeGroupName]() {
                let ud = this._lake_data_ as any
                if (ud && ud.lake) {
                    ud.lake.setGroup(getGroup(this))
                }
            }
        },
        // 创建的时候，加入事件机制
        beforeCreate() {
            // 屏蔽不需要融合的 节点
            let isIgnore = !this.$vnode || /-transition$/.test(this.$vnode.tag as string)
            // lakeData 数据存放
            let lakeData: vueLakeData = {
                // 不需要，忽略
                isIgnore
            }
            // eslint-disable-next-line
            this._lake_data_ = lakeData
            if (isIgnore) {
                return
            }

            let opt: any = this.$options
            lakeData.initGroup = opt[lakeGroupName] || []
            lakeData.instructs = opt[name + "Subs"] || []

            // 触发器
            // lakeData.self = new Lake({target: this})
        },
        created(this: any) {
            let lakeData = this._lake_data_ as vueLakeData
            if (lakeData.isIgnore) {
                // 忽略
                return
            }

            // 初始化
            let lake = (lakeData.lake = new VueLake({ target: this, id: this[lakeIdName], group: getGroup(this) }))

            // 订阅事件
            let instructs = lakeData.instructs || []
            instructs.forEach(subs => {
                for (let n in subs) {
                    lake.sub(n, subs[n])
                }
            })
        },
        // 全局混合， 销毁实例的时候，销毁事件
        destroyed(this: any) {
            let lakeData = this._lake_data_ as vueLakeData
            if (lakeData.isIgnore) {
                // 忽略
                return
            }
            // 销毁 lake 对象
            let lake = lakeData.lake
            if (lake) {
                lake.destroy()
            }
        }
    })

    interface lakeInObj {
        [propName: string]: (arg: VueLakeEvent) => VueLakeEvent
    }

    // 自定义属性合并策略
    let merge = Vue.config.optionMergeStrategies
    merge[name] = function(parentVal?: lakeInObj[], childVal?: lakeInObj) {
        let arr = parentVal || []
        if (childVal) {
            arr.push(childVal)
        }
        return arr
    }
    merge[lakeGroupName] = function(parentVal?: string[], childVal?: string | string[]) {
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

export default VueLake
