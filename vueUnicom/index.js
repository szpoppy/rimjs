"use strict";
/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2019-07-21] 重构,以事件模型为基础,多组件之间 订阅者和发布者来制作
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueUnicomInstall = exports.VueUnicom = exports.unicomEmit = exports.VueUnicomEvent = void 0;
// #id 存放id的unicom对象
var unicomGroupByID = {};
/**
 * 寄存target(vm)
 * @param target
 * @param newId
 * @param oldId
 */
function updateUnicomGroupByID(target, newId, oldId) {
    // 更新 id 触发更新
    if (oldId && unicomGroupByID[oldId] == target) {
        delete unicomGroupByID[oldId];
    }
    if (newId) {
        unicomGroupByID[newId] = target;
    }
}
// @name 存放name的数组对象
var unicomGroupByName = {};
/**
 * 通过name存放 target(vm)
 * @param target
 * @param name
 */
function addUnicomGroupByNameOne(target, name) {
    // 加入一个name
    var unicoms = unicomGroupByName[name];
    if (!unicoms) {
        unicoms = unicomGroupByName[name] = [];
    }
    if (unicoms.indexOf(target) < 0) {
        unicoms.push(target);
    }
}
/**
 * 更新unicom name命名
 * @param target
 * @param newName
 * @param oldNamegroup
 */
function updateUnicomGroupByName(target, newName, oldName) {
    // 某个unicom对象更新 name
    if (oldName) {
        // 移除所有旧的
        oldName.forEach(function (name) {
            var unicoms = unicomGroupByName[name];
            if (unicoms) {
                var index = unicoms.indexOf(target);
                if (index > -1) {
                    unicoms.splice(index, 1);
                }
            }
        });
    }
    if (newName) {
        // 加入新的
        newName.forEach(function (name) {
            addUnicomGroupByNameOne(target, name);
        });
    }
}
// @all 所有的unicom对象集合，发布指令是待用
var unicomGroup = [];
function addUnicomGroup(target) {
    // 添加
    unicomGroup.push(target);
}
function removeUnicomGroup(target) {
    // 移除
    var index = unicomGroup.indexOf(target);
    if (index > -1) {
        unicomGroup.splice(index, 1);
    }
}
// 发布指令时产生的事件的类
var VueUnicomEvent = /** @class */ (function () {
    function VueUnicomEvent(from, args) {
        var _this = this;
        // 来自
        this.from = from || null;
        // 目标绑定的对象，vue中代表vue的实例
        this.target = (from && from.target) || null;
        // 第一号数据
        this.data = args[0];
        // 多个数据 使用 $index 表示
        args.forEach(function (arg, index) {
            _this["$" + (index + 1)] = arg;
        });
    }
    return VueUnicomEvent;
}());
exports.VueUnicomEvent = VueUnicomEvent;
function _unicomEmit(self, query, data, args) {
    if (args === void 0) { args = []; }
    // 以下是全局触发发布
    var type = "";
    var target = "";
    var instruct = "";
    instruct = query.replace(/([@#])([^@#]*)$/, function (s0, s1, s2) {
        target = s2;
        type = s1;
        return "";
    });
    var targetUnicom = [];
    if (type == "#") {
        // 目标唯一
        var one = unicomGroupByID[target];
        if (!instruct) {
            // 只是获取
            return one;
        }
        if (one) {
            targetUnicom.push(one);
        }
    }
    else if (type == "@") {
        // 目标是个分组
        var group = unicomGroupByName[target];
        if (!instruct) {
            // 只是获取
            return group;
        }
        if (group) {
            targetUnicom.push.apply(targetUnicom, group);
        }
    }
    else {
        targetUnicom.push.apply(targetUnicom, unicomGroup);
    }
    args.unshift(data);
    var uniEvent = new VueUnicomEvent(self, args);
    targetUnicom.forEach(function (emit) {
        // 每个都触发一遍
        emit.emit(instruct, uniEvent);
    });
    return uniEvent;
}
function unicomEmit(query, data) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return _unicomEmit(null, query, data, args);
}
exports.unicomEmit = unicomEmit;
// 监控数据
var monitorArr = [];
function monitorExec(that) {
    for (var i = 0; i < monitorArr.length; i += 1) {
        var _a = monitorArr[i], type = _a[0], target = _a[1], callback = _a[2];
        if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
            // 运行监控回调
            callback(that);
        }
    }
}
// 通讯基础类
var VueUnicom = /** @class */ (function () {
    function VueUnicom(_a) {
        var _b = _a === void 0 ? {} : _a, id = _b.id, group = _b.group, target = _b.target;
        // 事件存放
        this._instruct_ = {};
        // 唯一的id
        this.id = "";
        // 私有属性
        // eslint-disable-next-line
        this._monitor_back_ = null;
        var _instruct_ = this._instruct_;
        this._instruct_ = {};
        if (_instruct_) {
            // 克隆一份 事件
            // 通过 Unicom.prototype.on() 会把事件写入 Unicom.prototype._instruct_
            // 所以要重写，防止全局冲突
            for (var n in _instruct_) {
                var arr = [];
                arr.push.apply(arr, _instruct_[n]);
                this._instruct_[n] = arr;
            }
        }
        // 绑定的目标对象
        this.target = target;
        // 分组
        this.group = [];
        if (id) {
            this.setId(id);
        }
        if (group) {
            this.setGroup(group);
        }
        // 将实例加入到单例的队列
        addUnicomGroup(this);
        // 查找监控中是否被监控中
        this.monitorBack();
    }
    // 延迟合并执行
    VueUnicom.prototype.monitorBack = function () {
        var _this = this;
        clearTimeout(this._monitor_back_);
        // eslint-disable-next-line
        this._monitor_back_ = setTimeout(function () {
            monitorExec(_this);
        }, 1);
        return this;
    };
    // 监听目标创建
    VueUnicom.prototype.monitor = function (instruct, callback) {
        var type = instruct.slice(0, 1);
        var target = instruct.slice(1, instruct.length);
        monitorArr.push([type, target, callback, this]);
        return this;
    };
    // 销毁监听
    VueUnicom.prototype.monitorOff = function (instruct, callback) {
        for (var i = 0; i < monitorArr.length;) {
            var _a = monitorArr[i], type = _a[0], target = _a[1], fn = _a[2], self_1 = _a[3];
            if (self_1 == this && (!instruct || instruct == type + target) && (!callback || callback == fn)) {
                monitorArr.splice(i, 1);
                continue;
            }
            i += 1;
        }
        return this;
    };
    // 销毁
    VueUnicom.prototype.destroy = function () {
        // 销毁队列
        removeUnicomGroup(this);
        // 移除
        updateUnicomGroupByID(this, "", this.id);
        updateUnicomGroupByName(this, [], this.group);
        // 监控销毁
        this.monitorOff();
        // 订阅销毁
        this.off();
    };
    // 唯一标识
    VueUnicom.prototype.setId = function (id) {
        if (this.id != id) {
            updateUnicomGroupByID(this, id, this.id);
            this.id = id;
            // 运行延后执行
            this.monitorBack();
        }
        return this;
    };
    // 分组
    VueUnicom.prototype.setGroup = function (group) {
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
    };
    VueUnicom.prototype.has = function (type) {
        var instruct = (this._instruct_ || {})[type];
        return !!(instruct && instruct.length > 0);
    };
    // 订阅消息
    VueUnicom.prototype.on = function (type, fn) {
        var instruct = this._instruct_ || (this._instruct_ = {});
        instruct[type] || (instruct[type] = []);
        instruct[type].push(fn);
        return this;
    };
    // 移除订阅
    VueUnicom.prototype.off = function (type, fn) {
        var instruct = this._instruct_;
        if (instruct) {
            if (fn) {
                var es = instruct[type];
                if (es) {
                    var index = es.indexOf(fn);
                    if (index > -1) {
                        es.splice(index, 1);
                    }
                    if (es.length == 0) {
                        delete instruct[type];
                    }
                }
            }
            else if (type) {
                delete instruct[type];
            }
            else {
                delete this._instruct_;
            }
        }
        return this;
    };
    // 触发订阅
    VueUnicom.prototype.emit = function (query, data) {
        var _this = this;
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        if (data && data instanceof VueUnicomEvent) {
            // 只需要负责自己
            var es = (this._instruct_ && this._instruct_[query]) || [];
            es.forEach(function (channelFn) {
                channelFn.call(_this.target, data);
            });
            return data;
        }
        // 以下是全局触发发布
        return _unicomEmit(this.target, query, data, args);
    };
    VueUnicom.install = vueUnicomInstall;
    VueUnicom.emit = unicomEmit;
    return VueUnicom;
}());
exports.VueUnicom = VueUnicom;
// vue 安装插槽
var unicomInstalled = false;
function vueUnicomInstall(V, _a) {
    var _b, _c, _d;
    var _e = _a === void 0 ? {} : _a, _f = _e.useProps, useProps = _f === void 0 ? true : _f;
    if (unicomInstalled) {
        // 防止重复install
        return;
    }
    unicomInstalled = true;
    var name = "unicom";
    function uniconExe(query) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = this._unicom_data_.unicom).emit.apply(_a, __spreadArray([query], args));
    }
    var is3 = V.version.indexOf("3") == 0;
    var destroyed = "destroyed";
    if (is3) {
        destroyed = "unmounted";
        var vA = V;
        vA.config.globalProperties["$" + name] = uniconExe;
    }
    else {
        // 添加原型方法
        var vV = V;
        vV.prototype["$" + name] = uniconExe;
    }
    // unicom-id
    var unicomIdName = name + "Id";
    // 分组  unicom-name
    var unicomGroupName = name + "Name";
    // 组合分组
    function getGroup(target) {
        var unicomData = target._unicom_data_;
        var names = target[unicomGroupName] || [];
        return unicomData.initGroup.concat(names);
    }
    var mixin = (_b = {
            // 创建的时候，加入事件机制
            beforeCreate: function () {
                // 屏蔽不需要融合的 节点
                var isIgnore = !is3 && (!this.$vnode || /-transition$/.test(this.$vnode.tag));
                // unicomData 数据存放
                var unicomData = {
                    // 不需要，忽略
                    isIgnore: isIgnore
                };
                // eslint-disable-next-line
                this._unicom_data_ = unicomData;
                if (isIgnore) {
                    return;
                }
                var opt = this.$options;
                unicomData.initGroup = opt[unicomGroupName] || [];
                unicomData.instructs = opt[name] || [];
                // 触发器
                // unicomData.self = new Unicom({target: this})
            },
            created: function () {
                var unicomData = this._unicom_data_;
                if (unicomData.isIgnore) {
                    // 忽略
                    return;
                }
                // 初始化
                var unicom = (unicomData.unicom = new VueUnicom({ target: this, id: this[unicomIdName], group: getGroup(this) }));
                // 订阅事件
                var instructs = unicomData.instructs || [];
                instructs.forEach(function (subs) {
                    for (var n in subs) {
                        unicom.on(n, subs[n]);
                    }
                });
            }
        },
        // 全局混合， 销毁实例的时候，销毁事件
        _b[destroyed] = function () {
            var unicomData = this._unicom_data_;
            if (unicomData.isIgnore) {
                // 忽略
                return;
            }
            // 销毁 unicom 对象
            var unicom = unicomData.unicom;
            if (unicom) {
                unicom.destroy();
            }
        },
        _b);
    if (useProps) {
        Object.assign(mixin, {
            props: (_c = {},
                // 命名
                _c[unicomIdName] = {
                    type: String,
                    default: ""
                },
                // 分组
                _c[unicomGroupName] = {
                    type: [String, Array],
                    default: ""
                },
                _c),
            watch: (_d = {},
                _d[unicomIdName] = function (nv) {
                    var ud = this._unicom_data_;
                    if (ud && ud.unicom) {
                        ud.unicom.setId(nv);
                    }
                },
                _d[unicomGroupName] = function () {
                    var ud = this._unicom_data_;
                    if (ud && ud.unicom) {
                        ud.unicom.setGroup(getGroup(this));
                    }
                },
                _d)
        });
    }
    // 全局混入 vue
    V.mixin(mixin);
    // 自定义属性合并策略
    var merge = V.config.optionMergeStrategies;
    merge[name] = function (parentVal, childVal) {
        var arr = parentVal || [];
        if (childVal) {
            arr.push(childVal);
        }
        return arr;
    };
    merge[unicomGroupName] = function (parentVal, childVal) {
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
exports.vueUnicomInstall = vueUnicomInstall;
exports.default = VueUnicom;
//# sourceMappingURL=index.js.map