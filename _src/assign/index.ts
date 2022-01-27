import forEach from "../each"

// 用于类型判断
const _toString: Function = Object.prototype.toString

function __assign(target: any, source: object, flag = false): any {
    forEach(source, function(item, n): void {
        if (item) {
            let type = _toString.call(item).toLowerCase()
            let isTArr = type == "[object array]"
            let isTObj = type == "[object object]"
            if (type == "[object date]") {
                target[n] = new Date(item.getTime())
                return
            }

            let targetType = _toString.call(target[n]).toLowerCase()
            if (isTArr || isTObj) {
                // 数组 或者 对象
                if (target[n] == null || (!flag && targetType != type)) {
                    target[n] = isTArr ? [] : {}
                }
                __assign(target[n], item, flag)
                return
            }
        }
        target[n] = item
    })
    return target
}

function _assign(target: any, objs: Array<any>, flag = false): any {
    forEach(objs, function(source: object) {
        __assign(target, source, flag)
    })
    return target
}

/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同target 的数据类型一致
 */
export function merge<T, U>(target: T, source: U): T & U
export function merge<T, U, V>(target: T, source1: U, source2: V): T & U & V
export function merge<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W
export function merge(target: object, ...sources: any[]): any {
    return _assign(target, sources, true)
}

/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同target 的数据类型一致
 */
export function assign<T, U>(target: T, source: U): T & U
export function assign<T, U, V>(target: T, source1: U, source2: V): T & U & V
export function assign<T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W
export function assign(target: object, ...sources: any[]): any {
    return _assign(target, sources, false)
}

export default {
    merge,
    assign
}
