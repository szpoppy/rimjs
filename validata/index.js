"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=index.js.map