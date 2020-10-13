/**
 * [2020-09-07] 开发
 */

// eslint-disable-next-line
import Vue, { VueConstructor } from "vue"
import Lake, { LakeEvent, lakeProt } from "../lake"
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
interface vueLakeData {
    isIgnore: boolean
    // 分组
    initGroup?: Array<string>
    // 指令
    instructs?: Array<vueInstruct>
    // 绑定的lake对象
    lake?: Lake
}

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

export function vueLakeInstall(Vue: VueConstructor) {
    if (lakeInstalled) {
        // 防止重复install
        return
    }
    lakeInstalled = true

    let name: "lake" = "lake"
    let lakeSubs = name + "Subs"

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
            lakeData.instructs = opt[lakeSubs] || []

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
        [propName: string]: (arg: LakeEvent) => LakeEvent
    }

    // 自定义属性合并策略
    let merge = Vue.config.optionMergeStrategies
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

export default Lake
