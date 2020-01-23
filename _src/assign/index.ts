import forEach from "../each"

// 用于类型判断
const _toString: Function = Object.prototype.toString

function _assign(target: object, objs: Array<object>, flag = false): object {
    forEach(objs, function(source: object) {
        forEach(source, function(item: any, n: string): void {
            if (item) {
                let type = _toString.call(item).toLowerCase()
                if (type == "[object date]") {
                    target[n] = new Date(item.getTime())
                    return
                }
                if (target[n] != null) {
                    let targetType = _toString.call(target[n]).toLowerCase()
                    if (type == "[object array]") {
                        if (!flag && targetType != type) {
                            target[n] = []
                        }
                        _assign(target[n], item, flag)
                        return
                    }
                    if (type == "[object object]") {
                        if (!flag && targetType != type) {
                            target[n] = {}
                        }
                        _assign(target[n], item, flag)
                        return
                    }
                }
            }
            target[n] = item
        })
    })
    return target
}

/**
 * 深度混合 对象
 * @param  target
 * @param  objs 每个单元应该同　target 的数据类型一致
 */
export function merge(target: object, ...objs: Array<object>): object {
    return _assign(target, objs, true)
}

/**
 * 深度克隆 对象
 * @param target
 * @param objs 每个单元应该同　target 的数据类型一致
 */
export function assign(target: object, ...objs: Array<object>): object {
    return _assign(target, objs, false)
}

export default assign
