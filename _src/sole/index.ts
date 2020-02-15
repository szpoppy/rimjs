// ====================================================================== 获取页面唯一的 id 值
// jsonp和禁止使用缓存中使用
let soleTime: number = new Date().getTime() - 1000000
let soleCount: number = 1000
export default function sole(): string {
    soleCount += 1
    return Number(Math.round((Math.random() + 1) * 1000000) + (new Date().getTime() - soleTime) + "" + soleCount).toString(36)
}
