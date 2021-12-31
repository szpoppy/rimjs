/**
 * [2020-09-07] 开发
 */

// eslint-disable-next-line
import Vue, { VueConstructor } from "vue"
import { App } from "vue3" // vue3
import Lake, { LakeEvent, lakePub } from "../lake"
export * from "../lake"

export interface IVueLakeBackOption {
    [propName: string]: <V extends Vue, D>(this: V, arg: LakeEvent<D>, next: () => Promise<void>) => void
}

// vue 安装插槽
let lakeInstalled: boolean = false

// vue中指令
interface vueInstruct {
    [propName: string]: (arg: LakeEvent) => void
}
// vue临时存储数据
class vueLakeData {
    isIgnore: boolean = false
    // 分组
    initGroup?: Array<string>
    // 指令
    instructs?: Array<vueInstruct>
    // 绑定的lake对象
    lake?: Lake

    setId(id: string): void {
        this.lake && this.lake.setId(id)
    }

    setGroup(group: string | string[]): void {
        this.lake && this.lake.setGroup(group)
    }
}

let lakeProt = Object.assign(
    async function<D>(this: any, query: any, data?: D): Promise<LakeEvent<D>> {
        let self = (this._lake_data_ && this._lake_data_.lake) || this
        return await lakePub(self, query, data)
    },
    {
        id: Lake.getId,
        group: Lake.getGroup
    }
)

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue> {
        lakeId?: string
        lakeName?: string | string[]
        lakeSubs?: IVueLakeBackOption
    }
}

declare module "vue/types/vue" {
    interface Vue {
        $lake: typeof lakeProt
        // eslint-disable-next-line
        _lake_data_?: vueLakeData
    }
}

declare module "vue" {
    // vue3
    interface ComponentCustomProperties {
        $lake: typeof lakeProt
        // eslint-disable-next-line
        _lake_data_?: vueLakeData
    }

    interface ComponentCustomOptions {
        lakeId?: string
        lakeName?: string | string[]
        lakeSubs?: IVueLakeBackOption
    }
}

export function vueLakeInstall(V: VueConstructor | App, { useProps = true } = {}) {
    if (lakeInstalled) {
        // 防止重复install
        return
    }
    lakeInstalled = true

    let name: "lake" = "lake"
    let lakeSubs = name + "Subs"

    let is3 = V.version.indexOf("3") == 0
    let destroyed = "destroyed"
    if (is3) {
        destroyed = "unmounted"
        let vA = V as App
        vA.config.globalProperties["$" + name] = lakeProt
    } else {
        // 添加原型方法
        let vV = V as VueConstructor
        vV.prototype["$" + name] = lakeProt
    }

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

    let mixin = {
        // 创建的时候，加入事件机制
        beforeCreate() {
            // 屏蔽不需要融合的 节点
            let isIgnore = !is3 && (!this.$vnode || /-transition$/.test(this.$vnode.tag as string))

            let opt: any = this.$options
            let names = opt[lakeGroupName] || []
            let ints = opt[lakeSubs] || []
            let id = opt[lakeIdName]
            if (!isIgnore && !id && names.length == 0 && ints.length == 0) {
                isIgnore = true
            }

            // lakeData 数据存放
            let lakeData = new vueLakeData()
            lakeData.isIgnore = isIgnore
            // eslint-disable-next-line
            this._lake_data_ = lakeData
            if (isIgnore) {
                return
            }

            lakeData.initGroup = names
            lakeData.instructs = ints

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
            let lake = (lakeData.lake = new Lake({ target: this, id: this[lakeIdName], group: getGroup(this) }))

            // 订阅事件
            let instructs = lakeData.instructs || []
            instructs.forEach(subs => {
                for (let n in subs) {
                    lake.sub(n, subs[n])
                }
            })
        },
        // 全局混合， 销毁实例的时候，销毁事件
        [destroyed](this: any) {
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
    }

    if (useProps) {
        Object.assign(mixin, {
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
                [lakeIdName](nv: string) {
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
            }
        })
    }

    // 全局混入 vue
    V.mixin(mixin)

    interface lakeInObj {
        [propName: string]: (arg: LakeEvent) => LakeEvent
    }

    // 自定义属性合并策略
    let merge = V.config.optionMergeStrategies
    merge[lakeSubs] = function(parentVal?: lakeInObj[], childVal?: lakeInObj) {
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

Object.assign(Lake, { install: vueLakeInstall })

export default Lake
