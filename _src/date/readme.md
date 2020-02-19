# date-h5

时间格式化

## 使用

> import dateFn from "rimjs/date"

## api

### 转换为时间对象

> dateFn.parse(date:String;Number;Date, isWipe:Boolean = false):Date

-   date 日期格式的字符串 毫秒数数字 或者日期
-   isWipe 是否只保留年月日
-   date 字符串后面根 GMT 表示格式化为指定时区的日期

> dateFn.parse(isWipe:Boolean = false):Date

-   获取当前时间
-   isWipe 是否只保留年月日

```javascript
// 获取客户端时间
dateFn.parse()

// 获取客户端时间，并只保留 年月日
dateFn.parse(true)

// 将字符串格式化为时间
dateFn.parse("2019-09-27 10:10:10")
// 这个时间为东8区的时间转化为本地时间
dateFn.parse("2019-09-27 10:10:10 GMT+0800")

// 将字符串格式化为时间,并只保留年月日
dateFn.parse("2019-09-27 10:10:10", true)

// 将数字转换为时间
dateFn.parse(1569549173461)
// GMT前面的也会自动转换为数字
dateFn.parse("1569549173461 GMT")
```

### 获取时间详情

> dateFn.get(date?:String;Number;Date, formatStr:String = ""):Object;String

-   date 日期格式的字符串 毫秒数数字 或者日期
-   formatStr 将日期详情格式化为字符串形式
-   return Object
    -   date 当前日期
    -   YYYY 四位年份
    -   YY 两位年份
    -   MM 两位月份
    -   M 月份
    -   DD 两位日
    -   D 日
    -   hh 两位小时
    -   h 小时
    -   mm 两位分钟
    -   m 分钟
    -   ss 两位秒
    -   s 秒
    -   w 数字周几
    -   W 汉字周几
    -   EW 英文简写周
    -   FW 中文 星期几
    -   X 汉字 今天 明天或者周几

```javascript
// 获取客户端时间详情
dateFn.get()

// 获取客户端时间格式化为 2019-09-27
dateFn.get(new Date(), "YYYY-MM-DD")

// 获取客户端时间格式化为 09-27 周五(今天 明天)
dateFn.get(new Date(), "MM-DD X")

// 将时间转化为东八区时间后，再格式化
dateFn.get(new Date(), "+8h:MM-DD X") // 返回字符串
dateFn.get(new Date(), "+8h:") // 返回对象
```

### 计算两时间的时差

> dateFn.diff(date1:String;Number;Date, date2:String;Number;Date[, formatStr:String]):Object;String
> dateFn.diff(num:Number[, formatStr:String]):Object;String

-   date1 date2 日期格式的字符串 毫秒数数字 或者日期
-   num 两日期的时差（毫秒数）
-   formatStr 需要格式化为的字符串（不传，会返回一个对象）
-   return Object
    -   ms 毫秒
    -   s 秒
    -   m 分钟
    -   h 小时
    -   d 日

```javascript
// => {ms:0, s: 2, m: 2, h: 0, d: 0}
dateFn.diff(122000);

// => 0时2分2秒
dateFn.diff("2019-09-27 10:10:10", "2019-09-27 10:12:12"， "h时m分s秒");
dateFn.diff(122000， "h时m分s秒");

// => 2分2秒
dateFn.diff("2019-09-27 10:10:10", "2019-09-27 10:12:12"， "<h:时><m:分>s秒");
dateFn.diff(122000， "<h:时>m分s秒");

// 获取客户端时间格式化为 2019-09-27
dateFn.get(new Date(), "YYYY-MM-DD");

// 获取客户端时间格式化为 09-27 周五(今天 明天)
dateFn.get(new Date(), "MM-DD X");
```

### 在一个时间上增加或者减少时间

> dateFn.append(n:String;Number[, date:String;Number;Date, formatStr:Strings|boolean]):Date;String

-   n:String
    -   1d 增加 1 天
    -   -1h 减少 1 小时
    -   1m 增加一分钟
    -   -1s 减少 1 秒钟
-   n:Number
    -   增加的毫秒数
-   date 日期格式的字符串 毫秒数字 或者日期
-   formatStr 将日期详情格式化为字符串形式（如果为空，返回为 Date）
-   formatStr true 去除时分秒的时间

```javascript
// => 明天现在
dateFn.append("1d");

// => 昨天现在
dateFn.append("-1d");

// => 2019-09-26的时间对象
dateFn.append("-1d"， "2019-09-27");

// => 2019-09-26
dateFn.append("-1d"， "2019-09-27", "YYYY-MM-DD");
```