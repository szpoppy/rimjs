interface initOpt {
    sep?: string;
    eq?: string;
    unescape?: Function;
    escape?: Function;
}
export interface IFQueryHash {
    [prot: string]: string | null | number | (string | null | number)[];
}
export declare class QueryString {
    sep: string;
    eq: string;
    unescape: typeof decodeURIComponent;
    escape: typeof encodeURIComponent;
    constructor(opt?: initOpt);
    /**
     * 解析为 对象输出
     * @param str
     */
    parse(str: string): IFQueryHash;
    /**
     * 序列化为字符串
     * @param opt
     */
    stringify(opt: IFQueryHash): string;
}
declare let qs: QueryString & {
    QueryString: typeof QueryString;
};
export declare function parseQS(str: string): IFQueryHash;
export declare function stringifyQS(opt: IFQueryHash): string;
export default qs;
