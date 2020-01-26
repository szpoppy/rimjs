"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// 插件默认名称
var defName = "life";
// 所有绑定关系
var hooks = {};
// 默认绑定
var hookDef;
// 所有的钩子参数
var hookLifes = {};
// emit产生的数据
var hookEmitData = {};
// 生成唯一ID
var lifeIndexNum = 100;
/**
 * 获取that绑定的数据
 * @param that
 */
function getHookLife(that) {
    var id = that._life_id_;
    if (!id) {
        lifeIndexNum += 1;
        id = "$" + lifeIndexNum.toString();
        // eslint-disable-next-line
        that._life_id_ = id;
    }
    var life = hookLifes[id];
    if (!life) {
        var data = {};
        for (var n in hookEmitData) {
            data[n] = hookEmitData[n];
        }
        life = hookLifes[id] = {
            that: that,
            ready: {},
            data: data
        };
    }
    return life;
}
/**
 * 获取数据中data对应的属性值
 * @param key
 * @param that
 */
function getHookEmitData(key, that) {
    var data = that ? getHookLife(that).data : hookEmitData;
    if (key) {
        return data[key];
    }
    return data;
}
/**
 * 增加 hookLife 节点
 * @param that
 * @param vueLifeName
 */
function addHookLifes(that, vueLifeName) {
    var life = getHookLife(that);
    life.ready[vueLifeName] = true;
    if (vueLifeName == hookDef && life.callback) {
        // 事件中的then函数
        life.callback();
    }
    return life;
}
/**
 * 整理触发的事件
 * @param life
 * @param key
 */
function hookEmitEvent(life, key) {
    return {
        data: life.data[key],
        /**
         * 当前vm中触发新的事件
         * @param key
         * @param value
         */
        emit: function (key, value) {
            hookEmit(key, value, life.that);
        },
        /**
         * 加入到ready后执行
         * @param callback
         */
        then: function (callback) {
            if (life.ready[hookDef]) {
                callback && callback();
                return;
            }
            life.callback = callback;
        }
    };
}
function _hookExec(key, life, data) {
    if (!data) {
        return;
    }
    var lifes = life.that.$options[defName] || [];
    var hook = hooks[key] || hookDef;
    if (!life.ready[hook]) {
        return;
    }
    // console.log(key, "lifes", lifes)
    var lifeFn;
    for (var i = 0; i < lifes.length; i += 1) {
        lifeFn = lifes[i][key];
        if (lifeFn) {
            lifeFn.call(life.that, hookEmitEvent(life, key));
        }
    }
}
function hookEmit(key, data, that) {
    var hookData = getHookEmitData("", that);
    hookData[key] = {
        data: data
    };
    if (that) {
        _hookExec(key, getHookLife(that), hookData[key]);
        return;
    }
    // console.log("hookLifes", hookLifes)
    for (var n in hookLifes) {
        _hookExec(key, hookLifes[n], hookData[key]);
    }
}
function vueLifeInstall(Vue, init) {
    // 初始化函数
    if (typeof init == "function") {
        init = {
            init: init
        };
    }
    var initFn = init.init;
    // 设定在什么钩子函数中出发
    hookDef = init.hookDef || "mounted";
    hooks = init.hooks || {};
    // prepose
    if (!hooks.prepose) {
        hooks.prepose = "beforeCreate";
    }
    // ready 名称
    if (init.lifeName) {
        defName = init.lifeName;
    }
    var initArgs = init.args == null ? [] : Object.prototype.toString.call(init.args).toLowerCase() != "[object array]" ? [init.args] : init.args;
    function hookExecByVM(that, lifeName) {
        var life = addHookLifes(that, lifeName);
        var lifes = that.$options[defName] || [];
        var readys = {};
        for (var i = 0; i < lifes.length; i += 1) {
            for (var k in lifes[i]) {
                if (!readys[k] && (hooks[k] || hookDef) == lifeName) {
                    readys[k] = true;
                    _hookExec(k, life, getHookEmitData(k, that));
                }
            }
        }
    }
    function hooksFn(key) {
        return function () {
            // console.log("$$++++", key, hooks)
            var life = this.$options[defName];
            if (life) {
                if (hooks.prepose == key) {
                    // prepose 触发 emit
                    hookEmit("prepose", {}, this);
                }
                hookExecByVM(this, key);
            }
        };
    }
    // console.log("mixinOpt", mixinOpt)
    Vue.config.optionMergeStrategies[defName] = function (pVal, nVal) {
        var val = pVal instanceof Array ? pVal : pVal ? [pVal] : [];
        if (nVal) {
            val.push(nVal);
        }
        // console.log(val)
        return val;
    };
    if (initFn) {
        initFn.apply(void 0, __spreadArrays([{
                emit: function (key, data) {
                    hookEmit(key, data);
                },
                hooks: hooks,
                vue: Vue
            }], initArgs));
    }
    var mixinOpt = {};
    for (var n in hooks) {
        if (!mixinOpt[hooks[n]]) {
            mixinOpt[hooks[n]] = hooksFn(hooks[n]);
        }
    }
    if (!mixinOpt[hookDef]) {
        mixinOpt[hookDef] = hooksFn(hookDef);
    }
    // 销毁
    var destroyedFn = mixinOpt.destroyed;
    mixinOpt.destroyed = function () {
        if (destroyedFn) {
            destroyedFn.call(this);
        }
        var life = this.$options[defName];
        if (life) {
            for (var n in hookLifes) {
                if (this == hookLifes[n].that) {
                    delete hookLifes[n];
                }
            }
        }
    };
    Vue.mixin(mixinOpt);
}
exports.vueLifeInstall = vueLifeInstall;
exports.default = vueLifeInstall;
//# sourceMappingURL=index.js.map