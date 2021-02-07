"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vueFn = void 0;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var _toString = Object.prototype.toString;
/**
 * 获取安全数据
 * @param key
 * @param opt
 */
function getSafe(key, opt) {
    if (opt === undefined) {
        opt = this;
    }
    var arr = key.split(".");
    for (var i = 0; i < arr.length; i += 1) {
        opt = opt[arr[i]];
        if (opt == null) {
            break;
        }
    }
    return opt;
}
/**
 * Vue 数据整合
 * @param data1
 * @param data2
 * @param vm
 */
function assignData(data1, data2, vm) {
    if (!vm) {
        if (data1.$set) {
            vm = data1;
        }
    }
    for (var n in data2) {
        if (_hasOwnProperty.call(data2, n)) {
            if (vm && data1[n] == undefined && vm != data1) {
                vm.$set(data1, n, data2[n]);
                continue;
            }
            var type1 = _toString.call(data1[n]).toLowerCase();
            var type2 = _toString.call(data2[n]).toLowerCase();
            if (type1 == type2 && type2 == "[object object]") {
                assignData(data1[n], data2[n], vm);
                continue;
            }
            data1[n] = data2[n];
        }
    }
}
// 错误提示
var msgOpt = {
    before: "vue已经初始化，请在初始化之前调用"
};
function warn(key, msg) {
    if (key === void 0) { key = ""; }
    if (msg === void 0) { msg = "before"; }
    console.warn(key, msgOpt[msg] || msg || "");
}
/**
 * 绑定方法的第一个参数
 * @param fn
 */
function $bind(fn) {
    if (typeof fn == "function") {
        var bind = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            args.unshift(getExt(this));
            // console.log("bind", this, getExt(this), args)
            return fn.apply(this, args);
        };
        bind.__$ext = true;
        return bind;
    }
    var type = _toString.call(fn).toLowerCase();
    if (type == "[object object]") {
        var back = {};
        var ofn = fn;
        for (var n in ofn) {
            back[n] = $bind(ofn[n]);
        }
        return back;
    }
    if (type == "[object array]") {
        var back = [];
        var fns = fn;
        for (var i = 0; i < fns.length; i += 1) {
            back[i] = $bind(fns[i]);
        }
        return back;
    }
    return fn;
}
// 生命周期
function lifecycleExec(fns) {
    return function () {
        for (var i = 0; i < fns.length; i += 1) {
            fns[i].apply(this, arguments);
        }
    };
}
function makeLifecycle(inits) {
    var lifecycles = {};
    if (inits) {
        inits.forEach(function (key) {
            lifecycles[key] = [];
        });
    }
    var back = {
        get: function () {
            return lifecycles;
        },
        on: function (key, fn, isBind) {
            if (isBind === void 0) { isBind = false; }
            if (typeof key == "string") {
                var lc = lifecycles[key];
                if (!lc) {
                    lc = lifecycles[key] = [];
                }
                if (isBind === true) {
                    lc.push($bind(fn));
                    return;
                }
                lc.push(fn);
                return;
            }
            for (var n in key) {
                back.on(n, key[n], fn);
            }
            return;
        },
        make: function (opt, exec) {
            if (opt === void 0) { opt = {}; }
            if (exec === void 0) { exec = lifecycleExec; }
            for (var n in lifecycles) {
                var fn = exec(lifecycles[n]);
                if (_toString.call(opt[n]).toLowerCase() == "[object array]") {
                    opt[n].push(fn);
                }
                else {
                    opt[n] = fn;
                }
            }
            return opt;
        },
        emit: function (vm, type) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var fns = lifecycles[type] || [];
            for (var i = 0; i < fns.length; i += 1) {
                fns[i].apply(vm, args);
            }
        },
        currying: function (key) {
            if (lifecycles[key] === undefined) {
                lifecycles[key] = [];
            }
            return function (fn, isBind) {
                back.on(key, fn, isBind);
            };
        },
        has: function () {
            for (var n in lifecycles) {
                return true;
            }
            return false;
        }
    };
    return back;
}
var exts = new Map();
function getExt(vm) {
    return exts.get(vm) || null;
}
function assignExt(vm, opt) {
    if (typeof opt == "function") {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            // args.unshift(getExt(vm))
            return opt.apply(vm, args);
        };
    }
    var type = _toString.call(opt).toLowerCase();
    if (type == "[object object]") {
        var back = {};
        for (var n in opt) {
            back[n] = assignExt(vm, opt[n]);
        }
        return back;
    }
    if (type == "[object array]") {
        var back = [];
        for (var i = 0; i < opt.length; i += 1) {
            back[i] = assignExt(vm, opt[i]);
        }
        return back;
    }
    return opt;
}
function setExt(vm, opt) {
    // debugger
    var data = Object.assign({}, opt);
    var temp = data.temp;
    delete data.temp;
    var ext = assignExt(vm, opt);
    ext.vm = vm;
    ext.temp = temp;
    exts.set(vm, ext);
}
function removeExt(vm) {
    var data = getExt(vm);
    if (!data) {
        return;
    }
    var temp = data.temp;
    if (temp) {
        for (var n in temp) {
            if (/^\$T\$/.test(n)) {
                clearTimeout(temp[n]);
                temp[n] = -1;
                continue;
            }
            if (/^\$I\$/.test(n)) {
                clearInterval(temp[n]);
                temp[n] = -1;
                continue;
            }
            temp[n] = undefined;
            delete temp[n];
        }
    }
    exts.delete(vm);
}
function vueFn() {
    var initFlag = false;
    var options = {};
    var merges = {};
    // data 数据收集
    var optData = {};
    merges.data = function (val) {
        Object.assign(optData, val);
    };
    // 官方函数式编程
    var optSetup = {};
    merges.setup = function (val) {
        for (var n in val) {
            optSetup[n] = val[n];
        }
    };
    options.methods = {};
    merges.methods = function (key, val) {
        var methodObj = {};
        if (typeof key == "function") {
            methodObj[key] = val;
        }
        else {
            Object.assign(methodObj, key);
        }
        var m = options.methods;
        for (var n in methodObj) {
            var fn = methodObj[n];
            var key_1 = n.replace(/^:/, "");
            if (key_1 != n && !fn.__$ext) {
                m[key_1] = $bind(fn);
                break;
            }
            m[key_1] = fn;
        }
    };
    // mixins
    options.mixins = [];
    function $set(prot, val) {
        var _a;
        if (initFlag) {
            warn("[$set]");
            return;
        }
        if (!prot) {
            return options;
        }
        var opt = typeof prot == "string" ? (_a = {}, _a[prot] = val, _a) : prot;
        for (var n in opt) {
            var fn = merges[n];
            if (fn) {
                fn(opt[n]);
                continue;
            }
            var oVal = options[n];
            var oType = _toString.call(oVal).toLowerCase();
            if (oVal) {
                if (oType == "[object object]") {
                    assignData(options[n], opt[n]);
                    continue;
                }
                if (oType == "[object array]") {
                    if (_toString.call(opt[n]).toLowerCase() == "[object array]") {
                        oVal.push.apply(oVal, opt[n]);
                    }
                    else {
                        oVal.push(opt[n]);
                    }
                    continue;
                }
            }
            options[n] = opt[n];
        }
        return options;
    }
    function quickSet(prot, formatFn) {
        if (formatFn) {
            merges[prot] = formatFn;
        }
        return function (key, val) {
            var _a;
            var data = val !== undefined && typeof key === "string" ? (_a = {}, _a[key] = val, _a) : key;
            $set(prot, data);
        };
    }
    var lifecycle = makeLifecycle();
    var extData = {
        get: function (key) {
            return getSafe(key, this);
        },
        set: function (key, val) {
            // let self = this as Vue
            if (typeof key === "string") {
                var k_1;
                var pre = key.replace(/\.(.+?)$/, function (s0, s1) {
                    k_1 = s1;
                    return "";
                });
                if (!k_1) {
                    this[key] = val;
                    return;
                }
                var data = getSafe(pre, this);
                // console.log("-------------", data, this.touch, pre)
                if (!data) {
                    return;
                }
                if (data[k_1] === undefined) {
                    this.$set(data, k_1, val);
                    return;
                }
                data[k_1] = val;
                return;
            }
            assignData(this, key);
        },
        temp: {}
    };
    var onExports = [];
    var pluginArg = {
        onExport: function (fn) {
            onExports.push(fn);
        },
        lifecycle: lifecycle,
        makeLifecycle: makeLifecycle,
        quickSet: quickSet,
        merges: merges,
        extData: extData
    };
    var fnArg = {
        plugin: function (plug) {
            return plug(pluginArg, fnArg);
        },
        // 通用
        $set: $set,
        $name: quickSet("name"),
        $mixins: quickSet("mixins"),
        $components: quickSet("components"),
        $directives: quickSet("directives"),
        // 参数
        $props: quickSet("props"),
        $data: function (key, val, vm) {
            var _a;
            var opt;
            if (typeof key == "string") {
                opt = (_a = {}, _a[key] = val, _a);
            }
            else {
                opt = key;
                vm = val;
            }
            assignData(vm || optData, opt);
        },
        $setup: function (key, val) {
            if (val !== undefined) {
                optSetup[key] = val;
                return;
            }
            var keyObj = key;
            for (var n in keyObj) {
                optSetup[n] = keyObj[n];
            }
        },
        $computed: quickSet("computed"),
        $filters: quickSet("filters"),
        $model: quickSet("model"),
        $watch: quickSet("watch"),
        $methods: quickSet("methods"),
        $lifecycle: lifecycle.on,
        $created: lifecycle.currying("created"),
        $mounted: lifecycle.currying("mounted"),
        $destroyed: lifecycle.currying("destroyed"),
        $: $bind,
        $getExt: getExt,
        $setExt: function (key, val) {
            var _a;
            var opt = typeof key == "string" ? (_a = {}, _a[key] = val, _a) : val;
            assignData(extData, opt);
        },
        $export: function () {
            output();
            return options;
        }
    };
    lifecycle.on("beforeCreate", function () {
        // console.log("beforeC", this)
        setExt(this, extData);
    });
    function output() {
        if (initFlag) {
            // 防止多次执行
            return null;
        }
        options.data = function () {
            return optData;
        };
        options.setup = function () {
            return optSetup;
        };
        lifecycle.on("destroyed", function () {
            // console.log("destroyed", this)
            removeExt(this);
        });
        while (onExports.length) {
            var fn = onExports.shift();
            fn && fn();
        }
        lifecycle.make(options);
        initFlag = true;
        // console.log("[options]", options)
        // fn && fn(options)
        // console.log("[options]", options, optData, optSetup)
        return options;
    }
    return fnArg;
}
exports.vueFn = vueFn;
exports.default = vueFn;
//# sourceMappingURL=index.js.map