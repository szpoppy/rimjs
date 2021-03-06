"use strict";
/**
 * [2020-09-07] 开发
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueLakeInstall = void 0;
var lake_1 = require("../lake");
__exportStar(require("../lake"), exports);
// vue 安装插槽
var lakeInstalled = false;
function vueLakeInstall(Vue) {
    var _a, _b;
    if (lakeInstalled) {
        // 防止重复install
        return;
    }
    lakeInstalled = true;
    var name = "lake";
    var lakeSubs = name + "Subs";
    // function(query: string, ...args: any) {
    //     return this._lake_data_.lake.emit(query, ...args)
    // }
    // 添加原型方法
    // Object.defineProperty(vue.prototype)
    Vue.prototype["$" + name] = lake_1.lakeProt;
    // lake-id
    var lakeIdName = name + "Id";
    // 分组  lake-name
    var lakeGroupName = name + "Name";
    // 组合分组
    function getGroup(target) {
        var lakeData = target._lake_data_;
        var names = target[lakeGroupName] || [];
        return lakeData.initGroup.concat(names);
    }
    // 全局混入 vue
    Vue.mixin({
        props: (_a = {},
            // 命名
            _a[lakeIdName] = {
                type: String,
                default: ""
            },
            // 分组
            _a[lakeGroupName] = {
                type: [String, Array],
                default: ""
            },
            _a),
        watch: (_b = {},
            _b[lakeIdName] = function (nv) {
                var ud = this._lake_data_;
                if (ud && ud.lake) {
                    ud.lake.setId(nv);
                }
            },
            _b[lakeGroupName] = function () {
                var ud = this._lake_data_;
                if (ud && ud.lake) {
                    ud.lake.setGroup(getGroup(this));
                }
            },
            _b),
        // 创建的时候，加入事件机制
        beforeCreate: function () {
            // 屏蔽不需要融合的 节点
            var isIgnore = !this.$vnode || /-transition$/.test(this.$vnode.tag);
            // lakeData 数据存放
            var lakeData = {
                // 不需要，忽略
                isIgnore: isIgnore
            };
            // eslint-disable-next-line
            this._lake_data_ = lakeData;
            if (isIgnore) {
                return;
            }
            var opt = this.$options;
            lakeData.initGroup = opt[lakeGroupName] || [];
            lakeData.instructs = opt[lakeSubs] || [];
            // 触发器
            // lakeData.self = new Lake({target: this})
        },
        created: function () {
            var lakeData = this._lake_data_;
            if (lakeData.isIgnore) {
                // 忽略
                return;
            }
            // 初始化
            var lake = (lakeData.lake = new lake_1.default({ target: this, id: this[lakeIdName], group: getGroup(this) }));
            // 订阅事件
            var instructs = lakeData.instructs || [];
            instructs.forEach(function (subs) {
                for (var n in subs) {
                    lake.sub(n, subs[n]);
                }
            });
        },
        // 全局混合， 销毁实例的时候，销毁事件
        destroyed: function () {
            var lakeData = this._lake_data_;
            if (lakeData.isIgnore) {
                // 忽略
                return;
            }
            // 销毁 lake 对象
            var lake = lakeData.lake;
            if (lake) {
                lake.destroy();
            }
        }
    });
    // 自定义属性合并策略
    var merge = Vue.config.optionMergeStrategies;
    merge[lakeSubs] = function (parentVal, childVal) {
        var arr = parentVal || [];
        if (childVal) {
            arr.push(childVal);
        }
        return arr;
    };
    merge[lakeGroupName] = function (parentVal, childVal) {
        var arr = parentVal || [];
        if (childVal) {
            if (typeof childVal == "string") {
                arr.push(childVal);
            }
            else {
                arr.push.apply(arr, childVal);
            }
        }
        return arr;
    };
}
exports.vueLakeInstall = vueLakeInstall;
exports.default = lake_1.default;
//# sourceMappingURL=index.js.map