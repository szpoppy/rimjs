/**
 * [2020-09-07] 开发
 */

interface lakeGather {
    [propName: string]: Lake // 任意类型
}
// #id 存放id的lake对象
let lakeGroupByID: lakeGather = {}
/**
 * 寄存target(vm)
 * @param target
 * @param newId
 * @param oldId
 */
function updateLakeGroupByID(target: Lake, newId: string, oldId: string): void {
    // 更新 id 触发更新
    if (oldId && lakeGroupByID[oldId] == target) {
        delete lakeGroupByID[oldId]
    }
    if (newId) {
        lakeGroupByID[newId] = target
    }
}

interface lakeGatherName {
    [propName: string]: Array<Lake> // 任意类型
}
// @name 存放name的数组对象
let lakeGroupByName: lakeGatherName = {}
/**
 * 通过name存放 target(vm)
 * @param target
 * @param name
 */
function addLakeGroupByNameOne(target: Lake, name: string): void {
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
function updateLakeGroupByName(target: Lake, newName: Array<string>, oldName: Array<string>) {
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
let lakeGroup: Array<Lake> = []
function addLakeGroup(target: Lake): void {
    // 添加
    lakeGroup.push(target)
}
function removeLakeGroup(target: Lake): void {
    // 移除
    let index = lakeGroup.indexOf(target)
    if (index > -1) {
        lakeGroup.splice(index, 1)
    }
}

function getLake<D, T extends Vue = Vue>(query: string): [Lake[], string] {
    // 以下是全局触发发布
    let type: string = ""
    let target: string = ""
    let instruct: string = ""
    instruct = query.replace(/([@#])([^@#]*)$/, function(s0, s1, s2) {
        target = s2
        type = s1
        return ""
    })

    let targetLake: Array<Lake> = []
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

// 发布指令时产生的事件的类
export class LakeEvent<D = any> {
    lakes: Lake[] = []
    instruct: string = ""
    from: Lake | null
    data: D;
    [propName: string]: any
    constructor(from: Lake | null, data: D, query?: string) {
        // 来自
        this.from = from
        // 数据
        this.data = data

        if (query) {
            let [lakes, instruct] = getLake(query)
            this.lakes = lakes
            this.instruct = instruct
        }
    }

    get lake() {
        return this.lakes[0] || null
    }
}

// 异步触发
async function _lakePub<D>(self: Lake | null, query: string, data?: D): Promise<LakeEvent<D>> {
    if (data === undefined) {
        data = {} as any
    }
    let uniEvent = new LakeEvent<D>(self, data as D, query)

    if (uniEvent.instruct == "" || uniEvent.lakes.length == 0) {
        return uniEvent
    }

    let unis = uniEvent.lakes.slice(0)
    let lake = unis.shift() as Lake
    let subs = [...lake.getSubs(uniEvent.instruct)]

    let next = async function() {
        if (subs.length) {
            let subFn = subs.shift() as Function
            let sLen = subs.length
            let uLen = unis.length
            await subFn.call(lake.target, uniEvent, next)
            if (uLen == unis.length && sLen == subs.length) {
                // subFn 内部没执行 next
                await next()
            }
            return
        }

        if (unis.length) {
            lake = unis.shift() as Lake
            subs = [...lake.getSubs(uniEvent.instruct)]
            await next()
            return
        }
    }

    await next()
    return uniEvent
}
export async function lakePub<D>(lake: Lake, query: string, data?: D):Promise<LakeEvent<D>>
export async function lakePub<D>(lake: string, query?: D):Promise<LakeEvent<D>>
export async function lakePub<D>(lake: Lake | string, query: string | D, data?: D):Promise<LakeEvent<D>> {
    if (typeof lake == "string") {
        return await _lakePub<D>(null, lake, query as D)
    }
    return await _lakePub<D>(lake, query as string, data)
}

// 监控数据
let monitorArr: Array<[string, string, Function, Lake?]> = []
function listenExec(that: Lake) {
    for (let i = 0; i < monitorArr.length; i += 1) {
        let [type, target, callback] = monitorArr[i]
        if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
            // 运行监控回调
            callback(that)
        }
    }
}

export interface ILakeArg<T> {
    id?: string
    group?: string | Array<string>
    target?: T
}
interface lakeInstruct {
    [propName: string]: Function[] // 任意类型
}

// 通讯基础类
export class Lake<T = any> {
    // 事件存放
    protected _instruct_: lakeInstruct = {}
    // 绑定目标 可以是vue的vm 也可以是任意
    target: T | Lake
    // 唯一的id
    id: string = ""
    // 属于的分组
    group: Array<string>

    static pub = lakePub
    static getId = (id: string) => getLake("#" + id)[0][0]
    static getGroup = (name: string) => getLake("@" + name)[0]

    // 私有属性
    // eslint-disable-next-line
    protected _monitor_back_: null | ReturnType<typeof setTimeout> = null
    constructor({ id, group, target }: ILakeArg<T> = {}) {
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
    protected listenExec(): Lake {
        clearTimeout(this._monitor_back_)
        // eslint-disable-next-line
        this._monitor_back_ = setTimeout(() => {
            listenExec(this)
        }, 1)

        return this
    }

    // 监听目标创建
    listen(instruct: string, callback: Function): Lake {
        let type = instruct.slice(0, 1)
        let target = instruct.slice(1, instruct.length)
        monitorArr.push([type, target, callback, this])
        return this
    }

    // 销毁监听
    unListen(instruct?: string, callback?: Function): Lake {
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
    setId(id: string): Lake {
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
    sub<D = any>(type: string, fn: (arg: LakeEvent<D>, next: () => Promise<void>) => void): Lake {
        let instruct = this._instruct_ || (this._instruct_ = {})
        instruct[type] || (instruct[type] = [])
        instruct[type].push(fn)
        return this
    }

    // 获取订阅的方法
    getSubs(query: string) {
        // 只需要负责自己
        return (this._instruct_ && this._instruct_[query]) || []
    }

    // 移除订阅
    unSub(type?: string, fn?: Function): Lake {
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
                this._instruct_ = {}
            }
        }
        return this
    }

    // 异步出发订阅
    async pub<D>(query: string, data?: D) {
        // 以下是全局触发发布
        return await _lakePub<D>(this, query, data)
    }
}

export default Lake
