"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGangAoTaiReside = exports.isForeignerReside = exports.isTaiwanPass = exports.isGangAoPass = exports.isPassport = exports.isUrl = exports.isIdCard = exports.isZip = exports.isEnglish = exports.isChinese = exports.isMobile = exports.isEmail = void 0;
/**
 * 是否为Email
 * @method Util.cUtilValidate.isEmail
 * @param {String} agr1
 * @return {boolean} flag
 */
function isEmail(text) {
    var reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return reg.test(text);
}
exports.isEmail = isEmail;
/**
 * 是否为合法手机号
 * @method Util.cUtilValidate.isMobile
 * @param {string}  text
 * @returns {boolean}
 */
function isMobile(text) {
    var reg = /^(1[0-9])\d{9}$/;
    return reg.test(text);
}
exports.isMobile = isMobile;
/**
 * 是否为中文字符
 * @method Util.cUtilValidate.isChinese
 * @param {string}  text
 * @returns {boolean}
 */
function isChinese(text) {
    var reg = /^[\u4e00-\u9fff]{0,}$/;
    return reg.test(text);
}
exports.isChinese = isChinese;
/**
 * 是否为英文字符
 * @method Util.cUtilValidate.isEnglish
 * @param {string}  text
 * @returns {boolean}
 */
function isEnglish(text) {
    var reg = /^[A-Za-z]+$/;
    return reg.test(text);
}
exports.isEnglish = isEnglish;
/**
 * 是否为6位数字邮编
 * @method Util.cUtilValidate.isZip
 * @param {string} text
 * @returns {boolean}
 */
function isZip(text) {
    var reg = /^\d{6}$/;
    return reg.test(text);
}
exports.isZip = isZip;
/**
 * 是否为合法身份证有效证
 * @method Util.cUtilValidate.isIdCard
 * @param {String} text
 * @returns {boolean} flag
 */
function isIdCard(idCard) {
    var num = idCard.toLowerCase().match(/\w/g);
    if (!num) {
        return false;
    }
    if (idCard.match(/^\d{17}[\dx]$/i)) {
        var sum = 0;
        var times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        for (var i = 0; i < 17; i++)
            sum += parseInt(num[i], 10) * times[i];
        if ("10x98765432".charAt(sum % 11) != num[17]) {
            return false;
        }
        return !!idCard.replace(/^\d{6}(\d{4})(\d{2})(\d{2}).+$/, "$1-$2-$3");
    }
    if (idCard.match(/^\d{15}$/)) {
        return !!idCard.replace(/^\d{6}(\d{2})(\d{2})(\d{2}).+$/, "19$1-$2-$3");
    }
    return false;
}
exports.isIdCard = isIdCard;
/**
 * 是否为合法Url
 * @method Util.cUtilValidate.isUrl
 * @param {String} target
 * @returns {boolean} flag
 */
function isUrl(target) {
    return /^http(s)?:\/\/[A-Za-z0-9-]+\.[A-Za-z0-9]+[/=?%\-&_~`@[\]:+!]*([^<>])*$/.test(target);
}
exports.isUrl = isUrl;
/**
 * 护照
 * @param {*} txt
 */
function isPassport(txt) {
    return /^[a-zA-Z0-9]{5,17}$/.test(txt);
}
exports.isPassport = isPassport;
/**
 * 港澳通行证（回乡证）
 * @param {*} txt
 */
function isGangAoPass(txt) {
    return /^(m|M|h|H)(\d{8}|\d{10})$/.test(txt);
}
exports.isGangAoPass = isGangAoPass;
/**
 * 台湾居民来往大陆通行证（台胞证）
 * @param {*} txt
 */
function isTaiwanPass(txt) {
    return /^(\d{8}|[a-zA-Z][0-9]{9})$/.test(txt);
}
exports.isTaiwanPass = isTaiwanPass;
/**
 * 外国人永久居留身份证
 * 15位 3为字母 + 12阿拉伯数字
 */
function isForeignerReside(txt) {
    return /^[a-zA-Z]{3}[0-9]{12}$/.test(txt);
}
exports.isForeignerReside = isForeignerReside;
/**
 * 港澳台居民居住证
 * 18位数字 开头为 81 || 82 || 83
 * 11.28 修改为 8100 || 8200 || 8300
 */
function isGangAoTaiReside(txt) {
    return /^8[1-3]0{2}\d{13}[0-9x]$/i.test(txt);
}
exports.isGangAoTaiReside = isGangAoTaiReside;
//# sourceMappingURL=index.js.map