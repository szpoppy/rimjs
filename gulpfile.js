const gulp = require('gulp');
const plugin = require('gulp-load-plugins')();

// sourcemap
let sourcemapFlag = false
function sourcemapsInit() {
    return plugin.if(sourcemapFlag, plugin.sourcemaps.init());
}

function sourcemapsWrite() {
    return plugin.if(sourcemapFlag, plugin.sourcemaps.write());
}

// es6 转换
function babel() {
    return plugin.babel({
        'presets': [
            'stage-0', 'env'
        ],
        'plugins': [
            "transform-export-extensions"
        ],
        'comments': false
    });
}

// uglify 压缩
function uglify() {
    return plugin.uglify();
}

// 压缩css
function cleanCss() {
    return plugin.cleanCss({
        compatibility: 'ie8',
        rebase: false
    });
}

// CSS 自动加上css前缀
function autoprefixer() {
    return plugin.autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
        cascade: false
    })
}

// 图片压缩
const pngquant = require('imagemin-pngquant');

function imagemin() {
    return plugin.imagemin({
        progressive: true,
        svgoPlugins: [{
            removeViewBox: false
        }],
        use: [
            pngquant()
        ]
    });
}

// html 压缩
function htmlmin(minify) {
    return plugin.htmlmin({
        removeComments: true, //清除HTML注释
        collapseWhitespace: true, //压缩HTML
        collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false, //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true, //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, //删除<style>和<link>的type="text/css"
        minifyJS: minify || false, //压缩页面JS
        minifyCSS: minify || false //压缩页面CSS
    });
}

// 全局gulp配置
const gulpBase = 'src'

function gulpSrc(src) {
    return gulpBase + (src || '')
}

function gulpDest(src) {
    return 'dist' + (src || '')
}

// 通用任务生成
function runTask() {
    var arg = Array.prototype.slice.call(arguments)
    var src = arg.shift();
    var handle = gulp.src(src, { base: gulpBase })
        // gulp 补丁，报错不退出
    arg.unshift(plugin.plumber());
    // 目录输出
    var build;
    arg.push(gulp.dest(gulpDest()));
    //console.log('src:', src, 'build:', build);
    while (arg.length) {
        handle = handle.pipe(arg.shift());
    }
    return handle;

}

// js 编译压缩
const jsSrc = [gulpSrc('/**/*.js'), '!' + gulpSrc('/**/*.min.js')];
gulp.task('js', function() {
    runTask(
        jsSrc,
        sourcemapsInit(),
        babel(),
        // 压缩
        uglify(),
        sourcemapsWrite()
    )
})

// Less
const lessSrc = [gulpSrc('/**/*.less'), '!' + gulpSrc('/**/_*.less')];
gulp.task('less', function() {
    runTask(
        lessSrc,
        sourcemapsInit(),
        //编译
        plugin.less(),
        autoprefixer(),
        //压缩
        cleanCss(),
        sourcemapsWrite()
    )
});

// CSS 压缩
const cssSrc = [gulpSrc('/**/*.css'), '!' + gulpSrc('/**.*.min.css')];
gulp.task('css', function() {
    runTask(
        cssSrc,
        sourcemapsInit(),
        autoprefixer(),
        //压缩
        cleanCss(),
        sourcemapsWrite()
    )
});

// html 压缩和执行tpl
var htmlSrc = [gulpSrc('/**/*.html')]
gulp.task('html', function() {
    runTask(
        htmlSrc,
        htmlmin(true)
    )
})

// 图片压缩
const imgSrc = [gulpSrc('/**/*.{png,jpg,gif,ico}')];
gulp.task('img', function() {
    runTask(
        imgSrc,
        plugin.newer({
            dest: gulpDest()
        }),
        imagemin()
    )
});

// 拷贝其他不处理的文件
const copyExt = 'swf,min.js,min.css,otf,eof,svg,ttf,woff,woff2,json';
const copySrc = [gulpSrc('/**/*.{' + copyExt + '}')];

gulp.task('copy', function() {
    runTask(
        copySrc,
        plugin.newer({
            dest: gulpDest()
        }),
        imagemin()
    )
});

gulp.task('watch', function() {
    gulp.watch(jsSrc, ['js']);
    gulp.watch(lessSrc, ['less']);
    gulp.watch(cssSrc, ['css']);
    gulp.watch(imgSrc, ['img']);
    gulp.watch(htmlSrc, ['html']);
    gulp.watch(copySrc, ['copy']);
});

// 执行所有任务 , 'html-share' 
gulp.task('build', plugin.sequence(['img', 'js'], ['less', 'css'], ['html', 'copy']));

//默认
gulp.task('default', function(cb) {
    plugin.express.run(['bin/www']);
    plugin.sequence(['build'], ['watch'], cb);
});