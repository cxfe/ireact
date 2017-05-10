/**
 * @file gulpfile 编译指令
 * @author zongyu(zongyu@baidu.com)
 */

var gulp = require('gulp');
var concat = require('gulp-concat');
var removeAuthor = require('./build/gulp-remove-author');
var addAuthor = require('./build/gulp-add-author');
var umd = require('gulp-umd');
var indent = require('gulp-indent');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');

var DOM_FILE_LIST = [
    'src/namespace.js',
    'src/lang.js',
    'src/VNode.js',
    'src/Component.js',
    'src/common.js',
    'src/dom.old.js',
    'src/diff.js',
    'src/export.js'
];

var DOM_WITH_STRING_FILE_LIST = [
    'src/namespace.js',
    'src/lang.js',
    'src/VNode.js',
    'src/Component.js',
    'src/common.js',
    'src/dom.old.js',
    'src/diff.js',
    'src/export.js',
    'src/render-to-string.js'
];

var JQUERY_FILE_LIST = [
    'src/namespace.js',
    'src/lang.jquery.js',
    'src/VNode.js',
    'src/Component.js',
    'src/common.js',
    'src/prop.js',
    'src/dom.jquery.js',
    'src/diff.js',
    'src/export.js'
];

var JQUERY_WITH_STRING_FILE_LIST = [
    'src/namespace.js',
    'src/lang.jquery.js',
    'src/VNode.js',
    'src/Component.js',
    'src/common.js',
    'src/prop.js',
    'src/dom.jquery.js',
    'src/diff.js',
    'src/export.js',
    'src/render-to-string.js'
];

/**
 * 渲染成字符串工具
 *
 * @type {Array}
 */
var STRING_FILE_LIST = [
    'src/namespace.js',
    'src/lang.js',
    'src/VNode.js',
    'src/Component.string.js',
    'src/common.js',
    'src/render-to-string.js',
    'src/export.string.js'
];

// IE9+渲染逻辑
gulp.task('render-to-dom', function () {

    return gulp.src(DOM_FILE_LIST)
        .pipe(removeAuthor())
        .pipe(concat('ireact-dom' + '.js'))
        .pipe(indent({
            tabs: false,
            amount: 4
        }))
        .pipe(umd({
            exports: function () {
                return 'React';
            },
            namespace: function () {
                return 'React';
            },
            template: 'build/umd.tpl'
        }))
        .pipe(addAuthor({
            name: 'ireact-dom',
            comment: '渲染虚拟DOM'
        }))
        .pipe(gulp.dest('dist/'));
});

// render to string函数
gulp.task('render-to-jquery', function () {

    return gulp.src(JQUERY_FILE_LIST)
        .pipe(removeAuthor())
        .pipe(concat('ireact-jquery' + '.js'))
        .pipe(indent({
            tabs: false,
            amount: 4
        }))
        .pipe(umd({
            dependencies: function () {
                return [{
                    name: 'jquery',
                    amd: 'jquery',
                    cjs: 'jquery',
                    global: 'jQuery',
                    param: '$'
                }];
            },
            exports: function () {
                return 'React';
            },
            namespace: function () {
                return 'React';
            },
            template: 'build/umd.tpl'
        }))
        .pipe(addAuthor({
            name: 'ireact-jquery',
            comment: '基于JQuery的React'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(sourcemaps.init())
        .pipe(uglify({
            mangle: {
                except: [
                    'require',
                    'exports',
                    'module',
                    '$'
                ]
            }
        }))
        .pipe(rename('ireact-jquery.min.js'))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('dist/'));
});

// render to string函数
gulp.task('render-to-jquery-with-string', function () {

    return gulp.src(JQUERY_WITH_STRING_FILE_LIST)
        .pipe(removeAuthor())
        .pipe(concat('ireact-jquery-with-string' + '.js'))
        .pipe(indent({
            tabs: false,
            amount: 4
        }))
        .pipe(umd({
            dependencies: function () {
                return [{
                    name: 'jquery',
                    amd: 'jquery',
                    cjs: 'jquery',
                    global: 'jQuery',
                    param: '$'
                }];
            },
            exports: function () {
                return 'React';
            },
            namespace: function () {
                return 'React';
            },
            template: 'build/umd.tpl'
        }))
        .pipe(addAuthor({
            name: 'ireact-jquery-with-string',
            comment: '添加了渲染字符串功能'
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(sourcemaps.init())
        .pipe(uglify({
            mangle: {
                except: [
                    'require',
                    'exports',
                    'module',
                    '$'
                ]
            }
        }))
        .pipe(rename('ireact-jquery-with-string.min.js'))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('dist/'));
});

gulp.task('default', ['render-to-dom', 'render-to-jquery', 'render-to-jquery-with-string'], function () {

});


