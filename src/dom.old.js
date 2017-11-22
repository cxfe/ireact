/**
 * @file dom.old 有兼容性的DOM操作
 * @author zongyu(zongyu@baidu.com)
 */

/**
 * 用于在DOM上添加组件引用的名字
 *
 * @note 使用随机名字以避免重复
 * @type {string}
 */
var ATTR_KEY = 'data-react-id';

/**
 * 全局唯一标识符
 *
 * @type {number}
 */
var uuid = 1;

/**
 * 全局数据缓存
 *
 * @inner
 * @type {Object}
 */
var GLOBAL_DATA_CACHE = {};

/**
 * 所有组件的缓冲，使用JS缓存，以避免IE6 - 7产生的BUG
 *
 * @type {Object}
 */
var VNODE_INSTANCE_MAP = {

    /**
     * 获取组件缓存
     *
     * @param {HTMLElement} elem 要获取的元素
     * @param {string} name 属性名字
     * @return {*} 返回数据
     */
    get: function (elem, name) {
        var id = elem[ATTR_KEY] || (elem[ATTR_KEY] = uuid++);
        var cache = GLOBAL_DATA_CACHE[id] = GLOBAL_DATA_CACHE[id] || {};
        return name == null && cache[name] || cache;
    },

    /**
     * 根据组件设置对应的缓存
     *
     * @param {HTMLElement} elem 要获取的元素
     * @param {string} name 属性名字
     * @param {*} value 要设置的值
     */
    set: function (elem, name, value) {
        var id = elem[ATTR_KEY] || (elem[ATTR_KEY] = uuid++);
        var cache = GLOBAL_DATA_CACHE[id] = GLOBAL_DATA_CACHE[id] || {};
        cache[name] = value;
    },

    /**
     * 清空组件数据
     *
     * @param {HTMLElement} elem 要获取的元素
     */
    clean: function (elem) {
        var id = elem[ATTR_KEY] || (elem[ATTR_KEY] = uuid++);
        delete GLOBAL_DATA_CACHE[id];
    }
};

/**
 * 判断是否为事件
 *
 * @const
 * @type {RegExp}
 */
var R_EVENT_PREFIX = /^on(\w+)(Capture)?$/i;

/**
 * 属性名和特征名的对应关系
 *
 * @inner
 * @type {Object}
 */
var PROP_FIX = {
    'for': 'htmlFor',
    'class': 'className'
};

each([
    'tabIndex',
    'readOnly',
    'maxLength',
    'cellSpacing',
    'cellPadding',
    'rowSpan',
    'colSpan',
    'useMap',
    'frameBorder',
    'contentEditable'
], function (i, item) {
    PROP_FIX[item.toLowerCase()] = item;
});

/**
 * 以下属性返回数字而不追加px
 *
 * @const
 * @type {Object}
 */
var CSS_NUMBER = {
    animationIterationCount: true,
    columnCount: true,
    fillOpacity: true,
    flexGrow: true,
    flexShrink: true,
    fontWeight: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    widows: true,
    zIndex: true,
    zoom: true
};

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

/* eslint-disable max-len */

/**
 * 判断一个属性是不是布尔属性
 *
 * @inner
 * @type {RegExp}
 */
var R_PROPERTY_BOOLEAN = /^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i;
/* eslint-enable max-len */

/**
 * 判断属性名是不是可以用default-value可获取（IE67）
 *
 * @inner
 * @type {RegExp}
 */
var R_USE_DEFAULT = /^(?:checked|selected)$/i;

/**
 * 获取或者设置元素的属性
 *
 * @param {Node|HTMLElement} node 要获取的元素
 * @param {string=} name 属性名字
 * @param {*} value 属性的值
 * @param {boolean} isSvg 是否为SVG模式
 */
function setAccessor(node, name, value, isSvg, old) {

    if (node.nodeType !== 1 || name === 'key' || name === 'ref') {
        return;
    }

    name = name.toLowerCase();

    // 优先处理事件
    if (R_EVENT_PREFIX.test(name)) {
        var type = RegExp.$1;
        value ? node.addEventListener(type, value, !!RegExp.$2) : node.removeEventListener(type, old, !!RegExp.$2);
        return;
    }

    // 处理设置HTML
    if (name === 'dangerouslySetInnerHTML') {
        if (value) {
            node.innerHTML = value.__html || '';
        }

        return;
    }

    // 处理SVG对象
    if (isSvg && /^xlink:?(.+)/.test(name)) {
        if (value == null || value === false) {
            node.removeAttributeNS('http://www.w3.org/1999/xlink', RegExp.$1);
        }
        else {
            node.setAttributeNS('http://www.w3.org/1999/xlink', RegExp.$1, value);
        }

        return;
    }

    var attrName = PROP_FIX[name] || name;

    // 处理布尔值
    if (R_PROPERTY_BOOLEAN.test(name)) {

        value = !!value;

        if (!R_USE_DEFAULT.test(name)) {
            node[attrName] = value;
        }
        else {
            node['default-' + name.charAt(0).toUpperCase() + name.slice(1)] = node[attrName] = value;
        }

        return;
    }

    // 将对象类型的类转换成字符串类型
    if (attrName === 'className' && value && typeof value === 'object') {
        value = hashToClassName(value);
    }

    // 将对象类型的样式转换成字符串，不使用单一样式替换，而是直接替换CSS
    if (name === 'style' && value && typeof value === 'object') {
        value = styleObjToCss(value);
    }

    value = value == null ? '' : value;

    // 处理样式
    if (name === 'style') {
        node.style.cssText = value;
        return;
    }

    node.setAttribute(name, value + '');
}
