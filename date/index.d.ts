export declare type dateType = boolean | number | string | Date;
/**
 * 新建一个时间对象
 * @param date 时间传入，支持 GMT
 * @param isWipe 是否去除时分秒
 * @return 返回新的时间对象（local）
 */
export declare function parseDate(date?: dateType, isWipe?: boolean): Date;
interface dateProt {
    date: Date;
    YYYY: number;
    SSS: string;
    YY: number;
    MM: string;
    M: number;
    DD: string;
    D: number;
    hh: string;
    h: number;
    mm: string;
    m: number;
    ss: string;
    s: number;
    w: number;
    W: string;
    EW: string;
    FW: string;
    X: string;
}
/**
 * 将date格式化为formatStr的格式
 * @param date
 * @param formatStr
 */
export declare function getDate(date: dateType): dateProt;
export declare function getDate(date: dateType, formatStr: string): string;
interface diffProt {
    D: number;
    DD: string;
    ms: number;
    mms: string;
    m: number;
    mm: string;
    h: number;
    hh: string;
    s: number;
    ss: string;
}
/**
 * date1 和 date2之间的时间差
 * @param arg1
 * @param arg2
 * @param arg3 格式化
 */
export declare function diffDate(arg1: number): diffProt;
export declare function diffDate(arg1: dateType, arg2: dateType): diffProt;
export declare function diffDate(arg1: number, arg2: string): string;
export declare function diffDate(arg1: dateType, arg2: dateType, arg3: string): string;
/**
 * 在date上增加时间
 * @param n
 * @param date
 * @param formatStr
 */
export declare function appendDate(n: string | number, date: dateType): Date;
export declare function appendDate(n: string | number, date: dateType, isWipe: boolean): Date;
export declare function appendDate(n: string | number, date: dateType, formatStr: string): string;
declare const _default: {
    parse: typeof parseDate;
    get: typeof getDate;
    diff: typeof diffDate;
    append: typeof appendDate;
};
export default _default;
