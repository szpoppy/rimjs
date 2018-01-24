(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) : factory();
}(this, (function () { 'use strict';


const slice = Array.prototype.slice;
// 自定义事件 类似 nodejs中的 EventEmitter
class EventEmitter {
    constructor(){
        // 克隆一份 事件
        this._monitor_ = Object.assign({}, this._monitor_ || {});
    }
    /**
     * 绑定事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    on(type, fun) {
        let monitor = this._monitor_ || (this._monitor_ = {});
        monitor[type] || (monitor[type] = []);
        monitor[type].push(fun);
        return this;
    }

    /**
     * 判断是否还有特定事件
     * @param type
     * @returns {*}
     */
    hasEvent(type) {
        let monitor = this._monitor_ && this._monitor_[type] || [];
        return monitor.length > 0 || !!this['on' + type];
    }

    /**
     * 只有执行一次的事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    onec(type, fun) {
        function funx() {
            fun.apply(this, arguments);
            this.off(type, funx);
        }
        this.on(type, funx);
        return this;
    }

    /**
     * 移除事件
     * @param type 事件名称
     * @param fun 事件方法
     * @returns {EventEmitter}
     */
    off(type, fun) {
        let monitor = this._monitor_;
        if (monitor) {
            if (fun) {
                let es = monitor[type];
                if (es) {
                    let index = es.indexOf(fun);
                    if (index > -1) {
                        es.splice(index, 1);
                    }
                }
            } else if (type) {
                delete monitor[type];
            } else {
                delete this._monitor_;
            }
        }
        return this;
    }

    /**
     * 触发事件
     * @param {String} type 事件名称
     * @param {*} ag 传递的参数
     */
    emit(type, ...ag) {
        let es = this._monitor_ && this._monitor_[type] || [];
        if (es.length) {
            for (let i = 0; i < es.length; i += 1) {
                es[i].apply(this, ag);
            }
        }
        let onFun = this['on' + type];
        onFun && onFun.apply(this, ag);
        return this;
    }

    /**
     * 扩展本身
     */
    assign(...args) {
        if(typeof args[0] === 'string'){
            this.assign({[args[0]]:args[1]})
        }
        else{
            args.unshift(this);
            Object.assign.apply(Object, args);
        }
        return this;
    }
}

/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2018-01-18] 增加分组， 可以直接获取分组的 vm
 */

let toString = Object.prototype.toString

// 事件
let unicom = new EventEmitter()

// vm容器
let vmHooks = [], evHooks = []

// group Name
let unicomGroupName = ''

// 分组
let groupForVm = {}

// 命名 唯一
let idForVm = {}
let unicomIdName = ''

// 转化为一维数组
function toOneArray(data, that, arr = []){
    if(toString.call(data).toLowerCase() == '[object array]'){
        for(let i = 0; i< data.length; i+=1){
            toOneArray(data[i], that, arr)
        }
    }
    else if(data){
        let key = String(data)
        if(that){
            if(!groupForVm[key]){
                groupForVm[key] = []
            }
            groupForVm[key].push(that)
        }
        arr.push(key)
    }
    return arr
}

// 交换 this 用
function sendSwitch(fn, that){
    return function(){
        let arg = Array.prototype.slice.call(arguments)
        let to = arg.shift()
        let isId = arg.shift()
        // #目标不存在  @分组不存在
        if(!!to && ((isId && that[unicomIdName] != to) || (!isId && (!that[unicomGroupName] || that[unicomGroupName].indexOf(to) < 0)))){
            // 目标不存在
            return
        }
        // 执行fn
        fn.apply(that, arg)
    }
}

// 发送容器
function send() {
    let arg = Array.prototype.slice.call(arguments)
    
    let to = '', isId = false
    let key = String(arg[0]).replace(/([@#])([^@#]*)$/, function(s0, s1, s2){
        to = s2
        isId = s1 == '#'
        return ''
    })
    arg.splice(0, 1, key, to, isId, this)
    //console.log('arg:', arg)
    unicom.emit.apply(unicom, arg)
}

// 安装配置 名称
function install(vue, {
    name = 'unicom',
    sendName,
    groupName,
    idName
} = {}) {
    if(install.installed){
        return
    }
    install.installed = true
    
    vue.prototype['$' + (sendName || (name + 'Send'))] = send

    unicomGroupName = groupName || (name + 'Name')

    Object.defineProperty(vue.prototype, '$' + (groupName || (name + 'VM')), {
        get () {
            return groupForVm
        }
    })
    

    unicomIdName = idName || (name + 'Id')

    Object.defineProperty(vue.prototype, '$' + unicomIdName, {
        get () {
            return idForVm
        }
    })

    vue.mixin({
        props: {
            // 命名
            [unicomIdName]:{
                type: String,
                default: ''
            }
        },
        // 创建的时候，加入事件机制
        beforeCreate () {
            let opt = this.$options
            let us = opt[name]
            //console.log(us)
            if(us){
                let uni = {}
                for(let n in us){
                    uni[n] = []
                    if(toString.call(us[n]).toLowerCase() != '[object array]'){
                        us[n] = [us[n]]
                    }
                    for(let i = 0; i<us[n].length; i+=1){
                        //console.log('us[n][i]', us[n][i])
                        if(us[n][i]){
                            let xfn = sendSwitch(us[n][i], this)
                            uni[n].push(xfn)
                            unicom.on(n, xfn)
                        }
                    }
                }
                evHooks.push(uni)
                vmHooks.push(this)
            }

            // 命名分组
            this[unicomGroupName] = toOneArray(opt[unicomGroupName], this)

            // 实例命名 唯一
            let id = (this.$options.propsData || {}).unicomId
            if(id){
                idForVm[id] = this
            }
        },
        // 全局混合， 销毁实例的时候，销毁事件
        destroyed () {
            // 销毁， 销毁 hooks 中的值
            let index = vmHooks.indexOf(this)
            if(index >= 0){
                let uni = evHooks[index]

                // 移除缓存
                vmHooks.splice(index, 1)
                evHooks.splice(index, 1)

                // 移除事件
                for(let n in uni){
                    uni[n].forEach(function(fn){
                        unicom.off(n, fn)
                    })
                }
            }

            // 分组，一对多， 单个vm可以多个分组名称
            this[unicomGroupName].forEach((name) => {
                let gs = groupForVm[name]
                if(gs){
                    let index = gs.indexOf(this)
                    if(index > -1){
                        gs.splice(index, 1)
                    }
                    if(gs.length == 0){
                        delete groupForVm[name]
                    }
                }
            })

            // 移除唯一ID
            let id = this.unicomId
            if(id && idForVm[id]){
                delete idForVm[id]
            }
        }
    })

    // 使用 和 watch 一样的混合机制
    let merge = vue.config.optionMergeStrategies
    merge[name] = merge.watch
    // merge[unicomGroupName] = merge.methods
    merge[unicomGroupName] = function(parentVal, childVal){
        let x = []
        if(parentVal){
            x.push(parentVal)
        }
        if(childVal){
            x.push(childVal)
        }
        return x
    }
}


if(window.Vue){
    install(window.Vue)
}

return {EventEmitter, unicom, install}

})))