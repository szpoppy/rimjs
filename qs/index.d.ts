interface initOpt {
    sep?: string;
    eq?: string;
    unescape?: Function;
    escape?: Function;
}
interface QueryStringConstructor {
    new (opt?: initOpt): QueryString;
}
declare class QueryString {
    QS?: QueryStringConstructor;
    sep: string;
    eq: string;
    unescape: Function;
    escape: Function;
    constructor(opt?: initOpt);
    /**
     * 解析为 对象输出
     * @param str
     */
    parse(str: string): any;
    /**
     * 序列化为字符串
     * @param opt
     */
    stringify(opt: any): string;
}
declare let qs: QueryString;
export declare let parseQS: (str: string) => any;
export declare let stringifyQS: (opt: any) => string;
export default qs;
