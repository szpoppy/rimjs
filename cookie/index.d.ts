declare type TExpiration = number | string | Date;
/**
 * 获取cookie
 * @param {String} key
 */
export declare function getCookie(key: string): string;
/**
 * 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
 * @param {Number|String|Date} expiration 1d 1天 1h 1小时 1m 1分钟
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
export declare function setCookie(key: string, value: string, expiration?: TExpiration, path?: string, domain?: string): void;
/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
export declare function removeCookie(key: string, path?: string, domain?: string): void;
export default class Cookie {
    expiration?: Date;
    path?: string;
    domain?: string;
    constructor({ expiration, path, domain }?: {
        expiration: TExpiration;
        path?: string;
        domain?: string;
    });
    static getItem: typeof getCookie;
    getItem(key: string): string;
    static setItem: typeof setCookie;
    setItem(key: string, value: string): void;
    static removeItem: typeof removeCookie;
    removeItem(key: string): void;
}
export {};
