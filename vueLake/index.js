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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueLakeInstall = void 0;
var lake_1 = __importStar(require("../lake"));
__exportStar(require("../lake"), exports);
// vue 安装插槽
var lakeInstalled = false;
// vue临时存储数据
var vueLakeData = /** @class */ (function () {
    function vueLakeData() {
        this.isIgnore = false;
    }
    vueLakeData.prototype.setId = function (id) {
        this.lake && this.lake.setId(id);
    };
    vueLakeData.prototype.setGroup = function (group) {
        this.lake && this.lake.setGroup(group);
    };
    return vueLakeData;
}());
var lakeProt = Object.assign(function (query, data) {
    return __awaiter(this, void 0, void 0, function () {
        var self;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    self = (this._lake_data_ && this._lake_data_.lake) || this;
                    return [4 /*yield*/, lake_1.lakePub(self, query, data)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}, {
    id: lake_1.default.getId,
    group: lake_1.default.getGroup
});
function vueLakeInstall(V, _a) {
    var _b, _c, _d;
    var _e = _a === void 0 ? {} : _a, _f = _e.useProps, useProps = _f === void 0 ? true : _f;
    if (lakeInstalled) {
        // 防止重复install
        return;
    }
    lakeInstalled = true;
    var name = "lake";
    var lakeSubs = name + "Subs";
    var is3 = V.version.indexOf("3") == 0;
    var destroyed = "destroyed";
    if (is3) {
        destroyed = "unmounted";
        var vA = V;
        vA.config.globalProperties["$" + name] = lakeProt;
    }
    else {
        // 添加原型方法
        var vV = V;
        vV.prototype["$" + name] = lakeProt;
    }
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
    var mixin = (_b = {
            // 创建的时候，加入事件机制
            beforeCreate: function () {
                // 屏蔽不需要融合的 节点
                var isIgnore = !is3 && (!this.$vnode || /-transition$/.test(this.$vnode.tag));
                var opt = this.$options;
                var names = opt[lakeGroupName] || [];
                var ints = opt[lakeSubs] || [];
                var id = opt[lakeIdName];
                if (!isIgnore && !id && names.length == 0 && ints.length == 0) {
                    isIgnore = true;
                }
                // lakeData 数据存放
                var lakeData = new vueLakeData();
                lakeData.isIgnore = isIgnore;
                // eslint-disable-next-line
                this._lake_data_ = lakeData;
                if (isIgnore) {
                    return;
                }
                lakeData.initGroup = names;
                lakeData.instructs = ints;
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
            }
        },
        // 全局混合， 销毁实例的时候，销毁事件
        _b[destroyed] = function () {
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
        },
        _b);
    if (useProps) {
        Object.assign(mixin, {
            props: (_c = {},
                // 命名
                _c[lakeIdName] = {
                    type: String,
                    default: ""
                },
                // 分组
                _c[lakeGroupName] = {
                    type: [String, Array],
                    default: ""
                },
                _c),
            watch: (_d = {},
                _d[lakeIdName] = function (nv) {
                    var ud = this._lake_data_;
                    if (ud && ud.lake) {
                        ud.lake.setId(nv);
                    }
                },
                _d[lakeGroupName] = function () {
                    var ud = this._lake_data_;
                    if (ud && ud.lake) {
                        ud.lake.setGroup(getGroup(this));
                    }
                },
                _d)
        });
    }
    // 全局混入 vue
    V.mixin(mixin);
    // 自定义属性合并策略
    var merge = V.config.optionMergeStrategies;
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
Object.assign(lake_1.default, { install: vueLakeInstall });
exports.default = lake_1.default;
//# sourceMappingURL=index.js.map