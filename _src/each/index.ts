/**
 * 数据循环
 */

// 用于类型判断
const _toString: Function = Object.prototype.toString

// 数组push
function forPush(arr: any[], v: any): void {
    arr.push(v)
}

// 对象增加k-v
function forAppend(obj: object, v: any, k: string): void {
    obj[k] = v
}

// 普通
function forBack(): void {}

// 支持for循环的 数据
const forTypes = "-[object array]-[object nodelist]-[object htmlcollection]-[object arguments]-"

/**
 * 数据循环
 * @param arr arr或者obj
 * @param fn 运行函数
 * @param exe 返回的值
 */
export default function each(arr: any, fn: Function, exe?: any[] | object): any[] | object {
    // 终止循环
    let isStop: boolean = false
    function stop(): void {
        isStop = true
    }
    if (arr) {
        let doExe: Function = forBack
        if (exe) {
            doExe = typeof (exe as Array<any>).push == "function" ? forPush : forAppend
        }

        let len: number = arr.length
        if (forTypes.indexOf("-" + _toString.call(arr).toLowerCase() + "-") > -1 || "[object htmlcollection]" == String(arr).toLowerCase()) {
            for (let i = 0; i < len; i += 1) {
                let item = fn(arr[i], i, stop)
                if (isStop) {
                    break
                }
                doExe(exe, item, i)
            }
        } else {
            for (let n in arr) {
                if (!arr.hasOwnProperty || arr.hasOwnProperty(n)) {
                    let item = fn(arr[n], n, stop)
                    if (isStop) {
                        break
                    }
                    doExe(exe, item, n)
                }
            }
        }
    }

    return exe
}