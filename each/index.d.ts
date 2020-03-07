/**
 * 数据循环
 */
/**
 * 数据循环
 * @param arr arr或者obj
 * @param fn 运行函数
 * @param exe 返回的值
 */
export default function each<T>(arr: any, fn: (item: any, index: number | string, stop: () => void) => any, exe?: T): T | undefined;
