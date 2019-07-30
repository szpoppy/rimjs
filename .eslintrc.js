// https://eslint.org/docs/user-guide/configuring

let notDev = process.env.NODE_ENV == "production";

module.exports = {
    root: true,
    parserOptions: {
        parser: "babel-eslint"
    },
    env: {
        browser: true,
        es6: true
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
        "plugin:vue/essential",
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        "standard",
        "eslint:recommended"
    ],
    // required to lint *.vue files
    plugins: ["vue"],
    // add your custom rules here
    rules: {
        // allow async-await
        "generator-star-spacing": "off",
        // 引号类型 `` "" '' 不限制
        quotes: [0, "single"],
        // 缩进风格４空格, switch 不验证
        indent: ["error", 4, {
            SwitchCase: 1
        }],
        // 空行最多不能超过 5 行
        "no-multiple-empty-lines": [1, {
            max: 5
        }],
        // 一行结束后面不要有空格 这个限制不开启，压缩代码会自动去掉
        "no-trailing-spaces": 0,
        //　注释风格要不要有空格什么的
        "spaced-comment": 0,
        //　语句强制分号结尾
        semi: [0, "always"],
        // 必须使用全等
        eqeqeq: 0,
        // 文件以单一的换行符结束
        "eol-last": 0,
        // 函数定义时括号前面要不要有空格 不检测
        "space-before-function-paren": [0, "always"],
        // reutrn 后面可以为空
        "no-useless-return": 0,
        // 不能有声明后未被使用的变量或参数 提示
        "no-unused-vars": [1, {
            vars: "all",
            args: "after-used"
        }],
        // 连续声明 允许
        "one-var": 0,
        // 小括号里面要不要有空格 不检查
        "space-in-parens": [0, "never"],
        // new 不做检测
        "no-new": 0,
        // 函数名首行大写必须使用new方式调用，首行小写必须用不带new方式调用
        "new-cap": 1,
        // 禁止重复声明变量
        "no-redeclare": 2,
        // 允许 尤达条件
        yoda: [0, "never"],
        // 强制驼峰法命名 提示
        camelcase: 1,
        // 使用tabs 提示
        "no-tabs": 1,
        // 计算属性内，不应该对 属性赋值， 提示
        "vue/no-side-effects-in-computed-properties": 1,
        // callback 正常回调
        "standard/no-callback-literal": 0,
        // 不能有不规则的空格 提示
        "no-irregular-whitespace": 1,
        // 块语句内行首行尾是否要空行
        "padded-blocks": 0,
        // 换行风格 不验证
        "linebreak-style": [0, "windows"],
        // && || 不验证意图
        "no-mixed-operators": 0,
        // 逗号前后的空格
        "comma-spacing": 0,
        // 头部import 不验证
        "import/first": 0,
        // 必须使用合法的typeof的值
        "valid-typeof": 0,
        // allow debugger during development
        "no-debugger": (notDev && 2) || 1,
        "no-empty": [2, {
            // 允许 try catch中空白花括号对
            "allowEmptyCatch": true
        }],
        "no-console": [1, {
            allow: ["warn", "error"]
        }]
    }
};