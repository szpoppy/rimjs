## cookie

```ts
import Cookie from "rimjs/cookie"

// new一个 指定固定的 domain path 以及过期时间
let mc = new Cookie({ expiration: "1d", path: "/", domain: "x.com" })

mc.getItem("cookie-key")
mc.setItem("cookie-key", "cookie-value")
mc.removeItem("cookie-key")

Cookie.getItem("cookie-key")
Cookie.setItem("cookie-key", "cookie-value", "1d", "/", "y.com")
Cookie.removeItem("cookie-key", "/", "y.com")
```
