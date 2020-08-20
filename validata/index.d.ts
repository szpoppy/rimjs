/**
 * 是否为Email
 * @method Util.cUtilValidate.isEmail
 * @param {String} agr1
 * @return {boolean} flag
 */
export declare function isEmail(text: string): boolean;
/**
 * 是否为合法手机号
 * @method Util.cUtilValidate.isMobile
 * @param {string}  text
 * @returns {boolean}
 */
export declare function isMobile(text: string): boolean;
/**
 * 是否为中文字符
 * @method Util.cUtilValidate.isChinese
 * @param {string}  text
 * @returns {boolean}
 */
export declare function isChinese(text: string): boolean;
/**
 * 是否为英文字符
 * @method Util.cUtilValidate.isEnglish
 * @param {string}  text
 * @returns {boolean}
 */
export declare function isEnglish(text: string): boolean;
/**
 * 是否为6位数字邮编
 * @method Util.cUtilValidate.isZip
 * @param {string} text
 * @returns {boolean}
 */
export declare function isZip(text: string): boolean;
/**
 * 是否为合法身份证有效证
 * @method Util.cUtilValidate.isIdCard
 * @param {String} text
 * @returns {boolean} flag
 */
export declare function isIdCard(idCard: string): boolean;
/**
 * 是否为合法Url
 * @method Util.cUtilValidate.isUrl
 * @param {String} target
 * @returns {boolean} flag
 */
export declare function isUrl(target: string): boolean;
/**
 * 护照
 * @param {*} txt
 */
export declare function isPassport(txt: string): boolean;
/**
 * 港澳通行证（回乡证）
 * @param {*} txt
 */
export declare function isGangAoPass(txt: string): boolean;
/**
 * 台湾居民来往大陆通行证（台胞证）
 * @param {*} txt
 */
export declare function isTaiwanPass(txt: string): boolean;
/**
 * 外国人永久居留身份证
 * 15位 3为字母 + 12阿拉伯数字
 */
export declare function isForeignerReside(txt: string): boolean;
/**
 * 港澳台居民居住证
 * 18位数字 开头为 81 || 82 || 83
 * 11.28 修改为 8100 || 8200 || 8300
 */
export declare function isGangAoTaiReside(txt: string): boolean;
