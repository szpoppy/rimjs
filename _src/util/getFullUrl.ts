// ===================================================================== 获得url的真实地址
// 判断请求是否为跨域使用
let linkA = document.createElement("a")
export function getFullUrl(url: string): string {
    linkA.setAttribute("href", url)
    return linkA.href
}

export default getFullUrl
