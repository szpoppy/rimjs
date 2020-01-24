/**
 * 获取cookie
 * @param {String} key
 */
export declare function getItem(key: string): string;
/**
 * 设置cookie
 * @param {String} key
 * @param {String} value
 * @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
 * @param {String} path 文档路径
 * @param {String} domain 域名，可以设置主域名
 */
export declare function setItem(key: string, value: string, expiration: number | string | Date, path?: string, domain?: string): void;
/**
 * 移除cookie
 * @param {*} key
 * @param {*} path 文档路径
 * @param {*} domain 域名，可以设置主域名
 */
export declare function removeItem(key: string, path?: string, domain?: string): void;
