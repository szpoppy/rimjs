export declare type dateType = boolean | number | string | Date;
/**
 * 新建一个时间对象
 * @param date 时间传入，支持 GMT
 * @param isWipe 是否去除时分秒
 * @return 返回新的时间对象（local）
 */
export declare function parseDate(date?: dateType, isWipe?: boolean): Date;
/**
 * 将date格式化为formatStr的格式
 * @param date
 * @param formatStr
 */
export declare function getDate(date?: dateType, formatStr?: string): any;
interface diffOut {
    D: number;
    ms: number;
    h: number;
    s: number;
}
/**
 * date1 和 date2之间的时间差
 * @param arg1
 * @param arg2
 * @param arg3 格式化
 */
export declare function diffDate(arg1: dateType | number, arg2: dateType | string, arg3?: string): string | diffOut;
/**
 * 在date上增加时间
 * @param n
 * @param date
 * @param formatStr
 */
export declare function appendDate(n: string | number, date: dateType, formatStr?: string): any;
declare const _default: {
    parse: typeof parseDate;
    get: typeof getDate;
    diff: typeof diffDate;
    append: typeof appendDate;
};
export default _default;
