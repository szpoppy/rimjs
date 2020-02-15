/**
 * 是否为Email
 * @method Util.cUtilValidate.isEmail
 * @param {String} agr1
 * @return {boolean} flag
 */
export function isEmail(text: string) {
    let reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(text)
}

/**
 * 是否为合法手机号
 * @method Util.cUtilValidate.isMobile
 * @param {string}  text
 * @returns {boolean}
 */
export function isMobile(text: string) {
    let reg = /^(1[0-9])\d{9}$/
    return reg.test(text)
}

/**
 * 是否为中文字符
 * @method Util.cUtilValidate.isChinese
 * @param {string}  text
 * @returns {boolean}
 */
export function isChinese(text: string) {
    let reg = /^[\u4e00-\u9fff]{0,}$/
    return reg.test(text)
}

/**
 * 是否为英文字符
 * @method Util.cUtilValidate.isEnglish
 * @param {string}  text
 * @returns {boolean}
 */
export function isEnglish(text: string) {
    let reg = /^[A-Za-z]+$/
    return reg.test(text)
}

/**
 * 是否为6位数字邮编
 * @method Util.cUtilValidate.isZip
 * @param {string} text
 * @returns {boolean}
 */
export function isZip(text: string) {
    let reg = /^\d{6}$/
    return reg.test(text)
}

/**
 * 是否为合法身份证有效证
 * @method Util.cUtilValidate.isIdCard
 * @param {String} text
 * @returns {boolean} flag
 */
export function isIdCard(idCard: string) {
    let num = idCard.toLowerCase().match(/\w/g)
    if (!num) {
        return false
    }
    if (idCard.match(/^\d{17}[\dx]$/i)) {
        let sum = 0
        let times = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
        for (let i = 0; i < 17; i++) sum += parseInt(num[i], 10) * times[i]
        if ("10x98765432".charAt(sum % 11) != num[17]) {
            return false
        }
        return !!idCard.replace(/^\d{6}(\d{4})(\d{2})(\d{2}).+$/, "$1-$2-$3")
    }
    if (idCard.match(/^\d{15}$/)) {
        return !!idCard.replace(/^\d{6}(\d{2})(\d{2})(\d{2}).+$/, "19$1-$2-$3")
    }
    return false
}

/**
 * 是否为合法Url
 * @method Util.cUtilValidate.isUrl
 * @param {String} target
 * @returns {boolean} flag
 */
export function isUrl(target: string) {
    return /^http(s)?:\/\/[A-Za-z0-9-]+\.[A-Za-z0-9]+[/=?%\-&_~`@[\]:+!]*([^<>])*$/.test(target)
}
