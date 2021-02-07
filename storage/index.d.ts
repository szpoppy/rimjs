/**
 * 本地存储分组类
 */
export declare class LSClass {
    preposition: string;
    /**
     * pre 为前置参数
     * @param pre
     */
    constructor(pre: string);
    /**
     * 获取本地存储
     * @param key key
     */
    getItem(key: string): any;
    /**
     * 设置本地存储
     * @param key
     * @param value 存入的值
     * @param expiration 过期时间
     */
    setItem(key: string, value: any, expiration?: number | string | Date): void;
    /**
     * 移除数据
     * @param key
     */
    removeItem(key: string): void;
}
/**
 * 输出类
 */
declare let ls: LSClass & {
    LSClass: typeof LSClass;
};
export declare let getStorage: (key: string) => any;
export declare let setStorage: (key: string, value: any, expiration?: number | string | Date) => void;
export declare let removeStorage: (key: string) => void;
export default ls;
