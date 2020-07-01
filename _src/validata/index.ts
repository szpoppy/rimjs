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

/**
 * 护照
 * @param {*} txt
 */
export function isPassport(txt: string) {
    return /^[a-zA-Z0-9]{5,17}$/.test(txt)
}

/**
 * 港澳通行证（回乡证）
 * @param {*} txt
 */
export function isGangAoPass(txt: string) {
    return /^(m|M|h|H)(\d{8}|\d{10})$/.test(txt)
}

/**
 * 台湾居民来往大陆通行证（台胞证）
 * @param {*} txt
 */
export function isTaiwanPass(txt: string) {
    return /^(\d{8}|[a-zA-Z][0-9]{9})$/.test(txt)
}

/**
 * 外国人永久居留身份证
 * 15位 3为字母 + 12阿拉伯数字
 */
export function isForeignerReside(txt: string) {
    return /^[a-zA-Z]{3}[0-9]{12}$/.test(txt)
}

/**
 * 港澳台居民居住证
 * 18位数字 开头为 81 || 82 || 83
 * 11.28 修改为 8100 || 8200 || 8300
 */
export function isGangAoTaiReside(txt: string) {
    return /^8[1-3]0{2}\d{13}[0-9x]$/i.test(txt)
}
