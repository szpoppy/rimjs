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
function forAppend(obj: any, v: any, k: string): void {
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
export function each(arr: any, fn: (item: any, index: number | string, stop: () => void) => any): void
export function each<T>(arr: any, fn: (item: any, index: number | string, stop: () => void) => any, exe: T): T
export function each<T>(arr: any, fn: (item: any, index: number | string, stop: () => void) => any, exe?: T): T | undefined {
    // 终止循环
    let isStop: boolean = false
    function stop(): void {
        isStop = true
    }
    if (arr) {
        let doExe: Function = forBack
        if (exe) {
            doExe = exe instanceof Array ? forPush : forAppend
        }

        let len: number = arr.length
        if (forTypes.indexOf("-" + _toString.call(arr).toLowerCase() + "-") > -1) {
            for (let i = 0; i < len; i += 1) {
                let item = fn(arr[i], i, stop)
                if (isStop) {
                    break
                }
                doExe(exe, item, i)
            }
        } else {
            for (let n in arr) {
                // eslint-disable-next-line
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

export default each
