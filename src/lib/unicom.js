(function(global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
        return;
    }
    if (typeof define === "function" && define.amd) {
        define(factory);
        return;
    }
    global.VueUnicom = factory();
})(window, function() {
    "use strict";

    /**
     * unicom 联通 想到中国联通就想到了这个名字 -_-
     * 目的，提供vue 全局的转发机制
     * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
     */

    // 目前所有实例化的 unicom通讯 方便做 订阅者和发布者

    // #id
    let unicomGroupByID = {};
    function updateUnicomGroupByID(target, newId, oldId) {
        // 更新
        if (oldId && unicomGroupByID[oldId] == target) {
            delete unicomGroupByID[oldId];
        }
        if (newId) {
            unicomGroupByID[newId] = target;
        }
    }

    // @name
    let unicomGroupByName = {};
    function addUnicomGroupByNameOne(target, name) {
        let unicoms = unicomGroupByName[name];
        if (!unicoms) {
            unicoms = unicomGroupByName[name] = [];
        }
        if (unicoms.indexOf(target) < 0) {
            unicoms.push(target);
        }
    }
    function updateUnicomGroupByName(target, newName, oldName) {
        if (oldName) {
            // 移除所有旧的
            oldName.forEach(function(name) {
                let unicoms = unicomGroupByName[name];
                if (unicoms) {
                    let index = unicoms.indexOf(target);
                    if (index > -1) {
                        unicoms.splice(index, 1);
                    }
                }
            });
        }

        if (newName) {
            // 加入新的
            newName.forEach(function(name) {
                addUnicomGroupByNameOne(target, name);
            });
        }
    }

    // @all
    let unicomGroup = [];
    function addUnicomGroup(target) {
        // 添加
        unicomGroup.push(target);
    }
    function removeUnicomGroup(target) {
        // 移除
        let index = unicomGroup.indexOf(target);
        if (index > -1) {
            unicomGroup.splice(index, 1);
        }
    }

    // 事件 参数
    class UnicomEvent {
        constructor(from, args) {
            this.from = from;
            this.target = from.target;
            this.data = args[0];
            args.forEach((arg, index) => {
                this["$" + (index + 1)] = arg;
            });
        }
    }

    // 单列模式触发
    function emitAll(self, type, target, instruct, args) {
        let targetUnicom = [];
        if (type == "#") {
            let one = unicomGroupByID[target];
            if (!instruct) {
                // 只是获取
                return one;
            }
            if (one) {
                targetUnicom.push(one);
            }
        } else if (type == "@") {
            let group = unicomGroupByName[target];
            if (!instruct) {
                // 只是获取
                return group;
            }
            if (group) {
                targetUnicom.push(...group);
            }
        } else {
            targetUnicom.push(...unicomGroup);
        }
        let uniEvent = new UnicomEvent(self, args);
        targetUnicom.forEach(function(emit) {
            emit.emit(instruct, uniEvent, ...args);
        });
        return uniEvent;
    }

    // 监控数据
    let monitorArr = [];
    function monitorExec(that) {
        for (let i = 0; i < monitorArr.length; i += 1) {
            let [type, target, callback] = monitorArr[i];
            if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
                // 运行回调
                callback(that);
            }
        }
    }

    // 通讯基础类
    class Unicom {
        constructor({ id, group, target = null } = {}) {
            // 克隆一份 事件
            this._instruct_ = {};
            let _instruct_ = this._instruct_;
            if (_instruct_) {
                for (let n in _instruct_) {
                    this._instruct_[n] = [].push(..._instruct_[n]);
                }
            }

            this.target = target;
            this.group = [];

            if (id) {
                this.setId(id);
            }

            if (group) {
                this.setGroup(group);
            }

            addUnicomGroup(this);

            // 运行延后执行，作为监控
            this.monitorBack();
        }

        // 延迟合并执行
        monitorBack() {
            clearTimeout(this._monitor_back_);
            this._monitor_back_ = setTimeout(() => {
                monitorExec(this);
            }, 1);
        }

        // 监听目标创建
        monitor(instruct, callback) {
            let type = instruct.slice(0, 1);
            let target = instruct.slice(1, instruct.length);
            monitorArr.push([type, target, callback, this]);
        }

        // 销毁监听
        monitorOff(instruct, callback) {
            for (let i = 0; i < monitorArr.length; ) {
                let [type, target, fn, self] = monitorArr[i];
                if (self == this && (!instruct || instruct == type + target) && (!callback || callback == fn)) {
                    monitorArr.splice(i, 1);
                    continue;
                }

                i += 1;
            }
        }

        // 销毁
        destroy() {
            removeUnicomGroup(this);

            // 移除
            updateUnicomGroupByID(this, null, this.id);
            updateUnicomGroupByName(this, null, this.group);

            // 监控销毁
            this.monitorOff();

            // 订阅销毁
            this.off();
        }

        // 唯一标识
        setId(id) {
            if (this.id != id) {
                updateUnicomGroupByID(this, id, this.id);
                this.id = id;

                // 运行延后执行
                this.monitorBack();
            }

            return this;
        }

        // 分组
        setGroup(group) {
            if (typeof group == "string") {
                this.group.push(group);
                addUnicomGroupByNameOne(this, group);
                return this;
            }

            // 重新更新
            updateUnicomGroupByName(this, group, this.group);
            this.group = group;

            // 运行延后执行
            this.monitorBack();
            return this;
        }

        has(type) {
            let instruct = (this._instruct_ || {})[type];
            return !!(instruct && instruct.length > 0);
        }

        /**
         * 绑定事件
         * @param type 事件名称
         * @param fun 事件方法
         * @returns {EventEmitter}
         */
        on(type, fun) {
            let instruct = this._instruct_ || (this._instruct_ = {});
            instruct[type] || (instruct[type] = []);
            instruct[type].push(fun);
            return this;
        }

        /**
         * 移除事件
         * @param type 事件名称
         * @param fun 事件方法
         * @returns {EventEmitter}
         */
        off(type, fun) {
            let instruct = this._instruct_;
            if (instruct) {
                if (fun) {
                    let es = instruct[type];
                    if (es) {
                        let index = es.indexOf(fun);
                        if (index > -1) {
                            es.splice(index, 1);
                        }
                        if (es.length == 0) {
                            delete instruct[type];
                        }
                    }
                } else if (type) {
                    delete instruct[type];
                } else {
                    delete this._instruct_;
                }
            }
            return this;
        }

        /**
         * 触发事件
         * @param {String} type 事件名称
         */
        emit(query, ...args) {
            let data = args[0];
            if (data && data.constructor == UnicomEvent) {
                // 只需要负责自己
                let es = (this._instruct_ && this._instruct_[query]) || [];
                es.forEach(channelFn => {
                    channelFn.apply(this.target || this, args);
                });
                return data;
            }

            // 以下是全局触发发布
            let type, target, instruct;
            instruct = query.replace(/([@#])([^@#]*)$/, function(s0, s1, s2) {
                target = s2;
                type = s1;
                return "";
            });

            return emitAll(this, type, target, instruct, args);
        }
    }

    // vue 安装插槽
    let unicomInstalled = false;
    Unicom.install = function(vue, { name = "unicom", unicomName, unicomId, unicomEmit, unicomClass } = {}) {
        if (unicomInstalled) {
            return;
        }
        unicomInstalled = true;

        // 添加原型方法
        let unicomEmitName = unicomEmit || name;
        vue.prototype["$" + unicomEmitName] = function() {
            return this._unicom_data_.self.emit(...arguments);
        };
        // 方便插件中引入
        let VueUnicomClassName = unicomClass;
        if (!VueUnicomClassName) {
            VueUnicomClassName = name.replace(/^\w/, function(s0) {
                return s0.toUpperCase();
            });
        }
        vue[VueUnicomClassName] = Unicom;

        // unicom-id
        let unicomIdName = unicomId || name + "Id";
        // 分组  unicom-name
        let unicomGroupName = unicomName || name + "Name";

        // 组合分组
        function getGroup(target) {
            let unicomData = target._unicom_data_;
            let names = target[unicomGroupName] || [];
            return unicomData.initGroup.concat(names);
        }

        // 全局混入
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
                    let unicom = this._unicom_data_ && this._unicom_data_.self;
                    if (unicom) {
                        unicom.setId(nv);
                    }
                },
                [unicomGroupName]() {
                    let unicom = this._unicom_data_ && this._unicom_data_.self;
                    if (unicom) {
                        unicom.setGroup(getGroup(this));
                    }
                }
            },
            // 创建的时候，加入事件机制
            beforeCreate() {
                // 屏蔽不需要融合的 节点
                let isIgnore = !this.$vnode || /-transition$/.test(this.$vnode.tag);
                let unicomData = (this._unicom_data_ = {
                    isIgnore
                });
                if (isIgnore) {
                    return;
                }
                let opt = this.$options;
                unicomData.initGroup = opt[unicomGroupName] || [];
                unicomData.channels = opt[name] || [];

                // 触发器
                // unicomData.self = new Unicom({target: this})
            },
            created() {
                let unicomData = this._unicom_data_;
                if (unicomData.isIgnore) {
                    return;
                }

                // 初始化
                let self = (unicomData.self = new Unicom({ target: this, id: this[unicomIdName], group: getGroup(this), subs: unicomData.channels }));

                // 订阅事件
                let subChannels = unicomData.channels;
                subChannels.forEach(function(subs) {
                    for (let n in subs) {
                        self.on(n, subs[n]);
                    }
                });
            },
            // 全局混合， 销毁实例的时候，销毁事件
            destroyed() {
                let unicomData = this._unicom_data_;
                if (unicomData.isIgnore) {
                    return;
                }
                unicomData.self.destroy();
            }
        });

        // 自定义属性合并策略
        let merge = vue.config.optionMergeStrategies;
        merge[name] = function(parentVal, childVal) {
            let arr = parentVal || [];
            if (childVal) {
                arr.push(childVal);
            }
            return arr;
        };
        merge[unicomGroupName] = function(parentVal, childVal) {
            let arr = parentVal || [];
            if (childVal) {
                if (typeof childVal == "string") {
                    arr.push(childVal);
                } else {
                    arr.push(...childVal);
                }
            }
            return arr;
        };
    };
    return Unicom;
});
