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
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
export declare function setCookie(key: string, value: string, expiration: number | string | Date, path?: string, domain?: string): void;
/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
export declare function removeCookie(key: string, path?: string, domain?: string): void;
declare const _default: {
    getItem: typeof getCookie;
    setItem: typeof setCookie;
    removeItem: typeof removeCookie;
};
export default _default;
