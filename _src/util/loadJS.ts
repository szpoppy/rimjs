// jsonp 加载方式需要使用
let head: HTMLElement = document.head || document.getElementsByTagName("head")[0] || document.documentElement
export function loadJS(url: string, callback: Function): HTMLScriptElement {
    // 创建节点
    let node: HTMLScriptElement = document.createElement("script")
    // 设置属性
    node.setAttribute("type", "text/javascript")
    node.onload = node.onerror = function() {
        node.onload = node.onerror = null
        callback && callback()
        setTimeout(function() {
            //防止回调的时候，script还没执行完毕
            // 延时 2s 删除节点
            if (node) {
                let parent = node.parentNode as HTMLElement
                parent.removeChild(node)
            }
        }, 2000)
    }
    node.async = true
    head.appendChild(node)
    node.src = url
    return node
}

export default loadJS
