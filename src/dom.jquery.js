/**
 * @file dom.jquery 基于Jquery的DOM操作
 * @author zongyu(zongyu@baidu.com)
 */

/**
 * 所有组件的缓冲，使用JS缓存，以避免IE6 - 7产生的BUG
 *
 * @type {Object}
 */
var DOM_CACHE_TOOL = {

    /**
     * 获取组件缓存
     *
     * @param {HTMLElement} elem 要获取的元素
     * @param {string} name 属性名字
     * @return {*} 返回数据
     */
    get: function (elem, name) {
        return $(elem).data(name);
    },

    /**
     * 根据组件设置对应的缓存
     *
     * @param {HTMLElement} elem 要获取的元素
     * @param {string} name 属性名字
     * @param {*} value 要设置的值
     */
    set: function (elem, name, value) {
        $(elem).data(name, value);
    },

    /**
     * 清空组件数据
     *
     * @param {HTMLElement} elem 要获取的元素
     */
    clean: function (elem) {
        $.cleanData([elem]);
    }
};

/**
 * 以下属性返回数字而不追加px
 *
 * @const
 * @type {Object}
 */
var CSS_NUMBER = $.cssNumber;

/**
 * 用于匹配大写字符
 *
 * @type {RegExp}
 */
var R_UPPERCASE = /([A-Z])/g;

/**
 * 用于匹配MS开头的样式
 *
 * @type {RegExp}
 */
var R_MS_START = /^ms-/g;

/**
 * 判断是否为事件
 *
 * @const
 * @type {RegExp}
 */
var R_EVENT_PREFIX = /^on(\w+)$/i;

/**
 * 将驼峰转换换连字符
 *
 * @param {string} s 要转换的字符串
 * @return {*}
 */
function hyphenate(s) {

    if (!s) {
        return '';
    }

    return s.replace(R_UPPERCASE, '-$1').toLowerCase().replace(R_MS_START, '-ms-');
}

/**
 * 对象类样式变更为字符串
 *
 * @param {Object} s 对象
 * @return {string}
 */
function styleObjToCss(s) {

    // 处理浏览器不支持透明度的问题
    var str = '';

    each(s, function (name, val) {

        if (val != null) {

            str += ' ' + hyphenate(name);
            str += ': ';
            str += val;

            if (typeof val === 'number' && !CSS_NUMBER[name]) {
                str += 'px';
            }

            str += ';';
        }
    });

    return str.slice(1);
}

/**
 * 将对象类的类名合并成字符串
 *
 * @param {Object} c 对象
 * @return {string}
 */
function hashToClassName(c) {

    var str = '';

    each(c, function (name, valid) {
        if (valid) {
            str += ' ' + name;
        }
    });

    return str.slice(1);
}

/**
 * 获取或者设置元素的属性
 *
 * @param {Node|HTMLElement} node 要获取的元素
 * @param {string=} name 属性名字
 * @param {*} value 属性的值
 * @param {boolean} isSvg 是否为SVG模式
 */
function setAccessor(node, name, value, isSvg) {

    if (node.nodeType !== 1 || name === 'key' || name === 'ref') {
        return;
    }

    // 优先处理事件
    if (R_EVENT_PREFIX.test(name)) {

        // 使用REACT名称空间，避免和原生事件重复
        var type = RegExp.$1.toLowerCase() + '.react';

        $(node).unbind(type);

        if (value) {
            $(node).bind(type, value)
        }

        return;
    }

    // 处理设置HTML
    if (name === 'dangerouslySetInnerHTML') {
        if (value) {
            $(node).html(value.__html);
        }
        return;
    }

    // 处理SVG对象（JQUERY对于SVG的处理有BUG，自己处理）
    if (isSvg) {

        var ns = /^xlink:?(.+)/.test(name);

        if (ns) {
            if (value == null || value === false) {
                node.removeAttributeNS('http://www.w3.org/1999/xlink', RegExp.$1);
            }
            else {
                node.setAttributeNS('http://www.w3.org/1999/xlink', RegExp.$1, value);
            }
        }
        else {
            if (value == null || value === false) {
                node.removeAttribute(name);
            }
            else {
                node.setAttribute(name, value);
            }
        }

        return;
    }

    // 将React自定义的属性转换成HTML属性
    name = PROP_ALIAS[name] || name;

    // 将对象类型的类转换成字符串类型
    if (name === 'class' && value && typeof value === 'object') {
        value = hashToClassName(value);
    }

    // 将对象类型的样式转换成字符串，不使用单一样式替换，而是直接替换CSS
    if (name === 'style' && value && typeof value === 'object') {
        value = styleObjToCss(value);
    }

    $(node).attr(name, value);
}
