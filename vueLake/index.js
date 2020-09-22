"use strict";
/**
 * [2020-09-07] 开发
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// #id 存放id的lake对象
var lakeGroupByID = {};
/**
 * 寄存target(vm)
 * @param target
 * @param newId
 * @param oldId
 */
function updateLakeGroupByID(target, newId, oldId) {
    // 更新 id 触发更新
    if (oldId && lakeGroupByID[oldId] == target) {
        delete lakeGroupByID[oldId];
    }
    if (newId) {
        lakeGroupByID[newId] = target;
    }
}
// @name 存放name的数组对象
var lakeGroupByName = {};
/**
 * 通过name存放 target(vm)
 * @param target
 * @param name
 */
function addLakeGroupByNameOne(target, name) {
    // 加入一个name
    var lakes = lakeGroupByName[name];
    if (!lakes) {
        lakes = lakeGroupByName[name] = [];
    }
    if (lakes.indexOf(target) < 0) {
        lakes.push(target);
    }
}
/**
 * 更新lake name命名
 * @param target
 * @param newName
 * @param oldNamegroup
 */
function updateLakeGroupByName(target, newName, oldName) {
    // 某个lake对象更新 name
    if (oldName) {
        // 移除所有旧的
        oldName.forEach(function (name) {
            var lakes = lakeGroupByName[name];
            if (lakes) {
                var index = lakes.indexOf(target);
                if (index > -1) {
                    lakes.splice(index, 1);
                }
            }
        });
    }
    if (newName) {
        // 加入新的
        newName.forEach(function (name) {
            addLakeGroupByNameOne(target, name);
        });
    }
}
// @all 所有的lake对象集合，发布指令是待用
var lakeGroup = [];
function addLakeGroup(target) {
    // 添加
    lakeGroup.push(target);
}
function removeLakeGroup(target) {
    // 移除
    var index = lakeGroup.indexOf(target);
    if (index > -1) {
        lakeGroup.splice(index, 1);
    }
}
function getLake(query) {
    // 以下是全局触发发布
    var type = "";
    var target = "";
    var instruct = "";
    instruct = query.replace(/([@#])([^@#]*)$/, function (s0, s1, s2) {
        target = s2;
        type = s1;
        return "";
    });
    var targetLake = [];
    if (type == "#") {
        // 目标唯一
        var one = lakeGroupByID[target];
        if (!instruct) {
            // 只是获取
            return [[one], ""];
        }
        if (one) {
            targetLake.push(one);
        }
    }
    else if (type == "@") {
        // 目标是个分组
        var group = lakeGroupByName[target];
        if (!instruct) {
            // 只是获取
            return [group, ""];
        }
        if (group) {
            targetLake.push.apply(targetLake, group);
        }
    }
    else {
        targetLake.push.apply(targetLake, lakeGroup);
    }
    return [targetLake, instruct];
}
// 发布指令时产生的事件的类
var VueLakeEvent = /** @class */ (function () {
    function VueLakeEvent(from, data, query) {
        this.lakes = [];
        this.instruct = "";
        // 来自
        this.from = from;
        // 数据
        this.data = data;
        if (query) {
            var _a = getLake(query), lakes = _a[0], instruct = _a[1];
            this.lakes = lakes;
            this.instruct = instruct;
        }
    }
    Object.defineProperty(VueLakeEvent.prototype, "lake", {
        get: function () {
            return this.lakes[0] || null;
        },
        enumerable: true,
        configurable: true
    });
    return VueLakeEvent;
}());
exports.VueLakeEvent = VueLakeEvent;
// 异步触发
function _lakePub(self, query, data) {
    return __awaiter(this, void 0, void 0, function () {
        var uniEvent, unis, lake, subs, next;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (data === undefined) {
                        data = {};
                    }
                    uniEvent = new VueLakeEvent(self, data, query);
                    if (uniEvent.instruct == "" || uniEvent.lakes.length == 0) {
                        return [2 /*return*/, uniEvent];
                    }
                    unis = uniEvent.lakes.slice(0);
                    lake = unis.shift();
                    subs = __spreadArrays(lake.getSubs(uniEvent.instruct));
                    next = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var subFn, sLen, uLen;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!subs.length) return [3 /*break*/, 4];
                                        subFn = subs.shift();
                                        sLen = subs.length;
                                        uLen = unis.length;
                                        return [4 /*yield*/, subFn.call(lake.target, uniEvent, next)];
                                    case 1:
                                        _a.sent();
                                        if (!(uLen == unis.length && sLen == subs.length)) return [3 /*break*/, 3];
                                        // subFn 内部没执行 next
                                        return [4 /*yield*/, next()];
                                    case 2:
                                        // subFn 内部没执行 next
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2 /*return*/];
                                    case 4:
                                        if (!unis.length) return [3 /*break*/, 6];
                                        lake = unis.shift();
                                        subs = __spreadArrays(lake.getSubs(uniEvent.instruct));
                                        return [4 /*yield*/, next()];
                                    case 5:
                                        _a.sent();
                                        return [2 /*return*/];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        });
                    };
                    return [4 /*yield*/, next()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, uniEvent];
            }
        });
    });
}
function lakePub(query, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _lakePub(null, query, data)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
exports.lakePub = lakePub;
// 监控数据
var monitorArr = [];
function listenExec(that) {
    for (var i = 0; i < monitorArr.length; i += 1) {
        var _a = monitorArr[i], type = _a[0], target = _a[1], callback = _a[2];
        if ((type == "#" && that.id == target) || (type == "@" && that.group.indexOf(target) > -1)) {
            // 运行监控回调
            callback(that);
        }
    }
}
var lakeProt = function (query, data) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = this._lake_data_ ? this._lake_data_.lake : this;
                    return [4 /*yield*/, _lakePub(self, query, data)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
};
lakeProt.id = function (id) {
    return getLake("#" + id)[0][0];
};
lakeProt.group = function (name) {
    return getLake("@" + name)[0];
};
// 通讯基础类
var VueLake = /** @class */ (function () {
    function VueLake(_a) {
        var _b = _a === void 0 ? {} : _a, id = _b.id, group = _b.group, target = _b.target;
        // 事件存放
        this._instruct_ = {};
        // 唯一的id
        this.id = "";
        // 私有属性
        // eslint-disable-next-line
        this._monitor_back_ = 0;
        // 绑定的目标对象
        this.target = target === undefined ? this : target;
        // 分组
        this.group = [];
        if (id) {
            this.setId(id);
        }
        if (group) {
            this.setGroup(group);
        }
        // 将实例加入到单例的队列
        addLakeGroup(this);
        // 查找监控中是否被监控中
        this.listenExec();
    }
    // 延迟合并执行
    VueLake.prototype.listenExec = function () {
        var _this = this;
        clearTimeout(this._monitor_back_);
        // eslint-disable-next-line
        this._monitor_back_ = setTimeout(function () {
            listenExec(_this);
        }, 1);
        return this;
    };
    // 监听目标创建
    VueLake.prototype.listen = function (instruct, callback) {
        var type = instruct.slice(0, 1);
        var target = instruct.slice(1, instruct.length);
        monitorArr.push([type, target, callback, this]);
        return this;
    };
    // 销毁监听
    VueLake.prototype.unListen = function (instruct, callback) {
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
    VueLake.prototype.destroy = function () {
        // 销毁队列
        removeLakeGroup(this);
        // 移除
        updateLakeGroupByID(this, "", this.id);
        updateLakeGroupByName(this, [], this.group);
        // 监控销毁
        this.unListen();
        // 订阅销毁
        this.unSub();
    };
    // 唯一标识
    VueLake.prototype.setId = function (id) {
        if (this.id != id) {
            updateLakeGroupByID(this, id, this.id);
            this.id = id;
            // 运行延后执行
            this.listenExec();
        }
        return this;
    };
    // 分组
    VueLake.prototype.setGroup = function (group) {
        if (typeof group == "string") {
            this.group.push(group);
            addLakeGroupByNameOne(this, group);
            return this;
        }
        // 重新更新
        updateLakeGroupByName(this, group, this.group);
        this.group = group;
        // 运行延后执行
        this.listenExec();
        return this;
    };
    VueLake.prototype.has = function (type) {
        var instruct = (this._instruct_ || {})[type];
        return !!(instruct && instruct.length > 0);
    };
    // 订阅消息
    VueLake.prototype.sub = function (type, fn) {
        var instruct = this._instruct_ || (this._instruct_ = {});
        instruct[type] || (instruct[type] = []);
        instruct[type].push(fn);
        return this;
    };
    // 获取订阅的方法
    VueLake.prototype.getSubs = function (query) {
        // 只需要负责自己
        return (this._instruct_ && this._instruct_[query]) || [];
    };
    // 移除订阅
    VueLake.prototype.unSub = function (type, fn) {
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
                this._instruct_ = {};
            }
        }
        return this;
    };
    // 异步出发订阅
    VueLake.prototype.pub = function (query, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _lakePub(this, query, data)];
                    case 1: 
                    // 以下是全局触发发布
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VueLake.install = vueLakeInstall;
    VueLake.pub = lakePub;
    VueLake.getId = lakeProt.id;
    VueLake.getGroup = lakeProt.group;
    return VueLake;
}());
exports.VueLake = VueLake;
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
    Vue.prototype["$" + name] = lakeProt;
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
            var lake = (lakeData.lake = new VueLake({ target: this, id: this[lakeIdName], group: getGroup(this) }));
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
exports.default = VueLake;
//# sourceMappingURL=index.js.map