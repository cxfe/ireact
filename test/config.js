/**
 * @file config edp test配置文件
 * @author zongyu(zongyu@baidu.com)
 */


module.exports = {

    basePath: '../',

    frameworks: ['jasmine', 'esl'],

    files: [
        'test/unit/lang.spec.js',
        'test/unit/VNode.spec.js',
        'test/unit/h.spec.js',
        'test/unit/render-to-string.spec.js',
        'test/unit/basic-render.spec.js',
        'test/unit/component-render.spec.js'
    ],

    coverageReporter: {
        type: 'html',
        dir: 'test/coverage/'
    },

    port: 8120,

    watch: true,

    browsers: [
        'IE',
        'Chrome'
    ],

    singleRun: false,

    requireConfig: {
        paths: {
            'jquery': 'http://apps.bdimg.com/libs/jquery/1.10.2/jquery',
            'ireact': '../dist/ireact-jquery-with-string.min'
        }
    }
};
