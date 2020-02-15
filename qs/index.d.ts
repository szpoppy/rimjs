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
    unescape: typeof decodeURIComponent;
    escape: typeof encodeURIComponent;
    constructor(opt?: initOpt);
    /**
     * 解析为 对象输出
     * @param str
     */
    parse(str: string): Record<string, any>;
    /**
     * 序列化为字符串
     * @param opt
     */
    stringify(opt: Record<string, any>): string;
}
declare let qs: QueryString;
export declare let parseQS: (str: string) => Record<string, any>;
export declare let stringifyQS: (opt: Record<string, any>) => string;
export default qs;
