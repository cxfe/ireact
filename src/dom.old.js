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
 * 获取元素的唯一性标识
 *
 * @inner
 * @param {HTMLElement|HTMLDocument|Object} elem 要获取的对象
 * @return {number} 返回元素的唯一性标识，如果元素非法返回-1
 */
function getElementUniqueId(elem) {

    var nodeType;

    // elem为空或者elem是DOM节点但不是元素/文档节点时，返回-1。
    if (elem == null || typeof elem !== 'object' && typeof elem !== 'function'
        || (nodeType = elem.nodeType) && nodeType !== 1 && nodeType !== 9) {
        return -1;
    }

    // IE11-使用uniqueID而不使用expando来避免污染innerHTML
    // 同时解决IE下object、embed、applet标签不支持expando属性的问题
    return nodeType === 1 && elem.uniqueID
        // 其它元素或者非IE浏览器直接使用expando
        || elem[ATTR_KEY]
        // 处理expando没有被赋值的问题
        || (elem[ATTR_KEY] = uuid++);
}

/**
 * 所有组件的缓冲，使用JS缓存，以避免IE6 - 7产生的BUG
 *
 * @const
 * @type {Object}
 */
var DOM_CACHE_TOOL = {

    /**
     * 获取组件缓存
     *
     * @param {Node} elem 要获取的元素
     * @param {string=} name 属性名字
     * @return {*} 返回数据
     */
    get: function (elem, name) {
        var id = getElementUniqueId(elem);
        var cache = GLOBAL_DATA_CACHE[id] = GLOBAL_DATA_CACHE[id] || {};
        return name != null ? cache[name] : cache;
    },

    /**
     * 根据组件设置对应的缓存
     *
     * @param {Node} elem 要获取的元素
     * @param {string} name 属性名字
     * @param {*} value 要设置的值
     */
    set: function (elem, name, value) {
        var id = getElementUniqueId(elem);
        var cache = GLOBAL_DATA_CACHE[id] = GLOBAL_DATA_CACHE[id] || {};
        cache[name] = value;
    },

    /**
     * 清空组件数据
     *
     * @param {Node} elem 要获取的元素
     */
    clean: function (elem) {

        var id = getElementUniqueId(elem);
        var cache = GLOBAL_DATA_CACHE[id] || {};
        var event = cache.event;
        var proxy = cache.proxy;

        // 清理需要解绑所有的事件
        each(event, function (name, fn) {
            if (fn) {
                DOM_EVENT_TOOL.unbind(elem, name, proxy);
            }
        });

        delete  GLOBAL_DATA_CACHE[id];
    }
};

/**
 * 返回false
 *
 * @inner
 * @return {boolean} 返回false
 */
function returnFalse() {
    return false;
}

/**
 * 返回true
 *
 * @inner
 * @return {boolean} 返回false
 */
function returnTrue() {
    return true;
}

/**
 * 可读写的事件类
 *
 * @class MiniEvent
 * @param {string|MiniEvent} src 事件对象或者事件类型字符串
 * @param {*=} prop 额外附加的属性
 * @constructor
 */
function MiniEvent(src, prop) {
    if (src && src.type) {
        this.originEvent = src;
        this.type = src.type;

        // 用来修正可能因为祖先元素事件被设置成阻止默认行为状态
        if (src.defaultPrevent
            || src.defaultPrevented === undefined
            && src.returnValue === false) {
            this.isDefaultPrevented = returnTrue;
        }

    }
    else {
        this.type = src;
    }

    for (var x in prop) {
        if (prop.hasOwnProperty(x)) {
            this[x] = prop[x];
        }
    }

    this.timeStemp = src && src.timeStemp || new Date().getTime();
    this.isMiniEvent = true;

}

MiniEvent.prototype = {
    constructor: MiniEvent,

    /**
     * 是否已经阻止默认行为
     *
     * @public
     */
    isDefaultPrevented: returnFalse,

    /**
     * 是否已经阻止冒泡
     *
     * @public
     */
    isPropagationStopped: returnFalse,

    /**
     * 是否阻止立即执行冒泡
     *
     * @public
     */
    isImmediatePropagationStopped: returnFalse,

    /**
     * 阻止默认行为
     *
     * @public
     */
    preventDefault: function () {

        var e = this.originEvent;

        this.isDefaultPrevented = returnTrue;

        if (!e) {
            return;
        }

        if (e.preventDefault) {
            e.preventDefault();
        }
        else {
            // 兼容 IE9-
            e.returnValue = false;
        }
    },

    /**
     * 阻止冒泡行为
     *
     * @public
     */
    stopPropagation: function () {

        var e = this.originEvent;

        this.isPropagationStopped = returnTrue;

        if (!e) {
            return;
        }

        if (e.stopPropagation) {
            e.stopPropagation();
        }
        else {
            // 兼容IE9-
            e.cancelBubble = true;
        }
    },

    /**
     * 阻止立即执行冒泡，会阻止次优先级事件的执行
     *
     * @public
     */
    stopImmediatePropagation: function () {

        var e = this.originEvent;

        this.isImmediatePropagationStopped = returnTrue;

        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }

        // 降级阻止冒泡
        this.stopPropagation();
    }
};

/**
 * 判断键盘事件
 *
 * @inner
 * @type {RegExp}
 */
var rkeyEvent = /^key/;

/**
 * 判断鼠标事件
 *
 * @inner
 * @type {RegExp}
 */
var rmouseEvent = /^(?:mouse|pointer|contextmenu)|click|wheel/i;

/**
 * 判断触屏事件
 *
 * @inner
 * @type {RegExp}
 */
var rtouchEvent = /^touch/;

/**
 * 事件自带的属性
 *
 * @inner
 * @type {Array}
 */
var props = ('altKey bubbles cancelable ctrlKey currentTarget eventPhase '
+ 'metaKey relatedTarget shiftKey target timeStamp view which').split(' ');

/**
 * 需要修复事件的钩子
 *
 * @inner
 * @type {Object}
 */
var fixHooks = {};

/**
 * 键盘事件钩子
 *
 * @inner
 * @type {Object}
 */
var keyHooks = {

    /**
     * 事件自带的属性
     *
     * @type {Array}
     */
    props: 'char charCode key keyCode'.split(' '),

    /**
     * 键盘事件的特殊处理
     *
     * @param {MiniEvent} event 事件对象
     * @param {Event} original 原始事件对象
     * @return {*} 处理结果
     */
    filter: function (event, original) {

        // 处理事件which的值，统一which，通过which来判断按键
        if (!event.which) {
            event.which = original.keyCode != null ? original.keyCode : original.charCode;
        }

        return event;
    }
};

/**
 * 鼠标事件钩子
 * @type {Object}
 */
var mouseHooks = {

    /**
     * 事件自带的属性
     *
     * @type {Array}
     */
    props: ('button buttons clientX clientY pageX pageY fromElement offsetX offsetY '
    + 'screenX screenY toElement').split(' '),

    /**
     * 鼠标事件的特殊处理
     *
     * @param {MiniEvent} event 事件对象
     * @param {Event} original 原始事件对象
     * @return {*} 处理结果
     */
    filter: function (event, original) {
        var button = original.button;

        // 计算丢失的pageX/Y（前提：保证clientX/Y可用）,兼容IE
        if (event.pageX == null && event.clientX != null) {
            var ownTarget = event.target.ownerDocument || document;
            var doc = ownTarget.documentElement;
            var body = ownTarget.body;

            event.pageX = original.clientX
                + (doc && doc.scrollLeft || body && body.scrollLeft || 0)
                - (doc && doc.clientLeft || body && body.clientLeft || 0);

            event.pageY = original.clientY
                + (doc && doc.scrollTop || body && body.scrollTop || 0)
                - (doc && doc.clientTop || body && body.clientTop || 0);
        }

        // 给click事件添加which属性：1 === left(左键)  2 === middle(滚轮)  3 === right(右键)
        // button没有标准化，只是微软自己最初定义的属性，所以不能直接使用
        // 所以IE鼠标点击事件不存在e.which，但是button属性记录了鼠标按键的规则，通过button修正which
        // IE button 1 === left(左键)   4 === middle(滚轮)   2 === right(右键)
        if (!event.which && button !== undefined) {
            switch (button) {
                case 1:
                    event.which = 1;
                    break;
                case 2:
                    event.which = 3;
                    break;
                case 4:
                    event.which = 2;
                    break;
                default:
                    event.which = 0;
            }
        }

        // 统一鼠标滚轮事件的参数
        // IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
        // firefox DOMMouseScroll detail 下3 上-3
        // firefox wheel detlaY 下3 上-3
        // IE9-11 wheel deltaY 下40 上-40
        // chrome wheel deltaY 下100 上-100
        event.wheelDelta = original.wheelDelta || ((original.deltaY || original.detail) > 0 ? -120 : 120);

        return event;
    }
};

/**
 * 触摸事件属性钩子
 * @type {Object}
 */
var touchHooks = {
    props: mouseHooks.props.concat(('touches changedTouches').split(' '))
};

/**
 * 对event进行修正
 *
 * @param {Event|MiniEvent} event 事件类型
 * @return {*} 处理结果
 */
function fix(event) {
    if (event.isMiniEvent) {
        return event;
    }

    var type = event.type;
    var fixHook = fixHooks[type];
    var newEvent = new MiniEvent(event);

    // 处理fixHook不存在
    if (!fixHook) {
        if (rkeyEvent.test(type)) {
            fixHook = keyHooks;
        }
        else if (rmouseEvent.test(type)) {
            fixHook = mouseHooks;
        }
        else if (rtouchEvent.test(type)) {
            fixHook = touchHooks;
        }
        else {
            fixHook = {};
        }
        fixHooks[type] = fixHook;

    }

    var copy = fixHook.props ? props.concat(fixHook.props) : props;
    var i = copy.length;

    while (i--) {
        var prop = copy[i];
        newEvent[prop] = event[prop];
    }

    // 兼容：Cordova 2.5(webkit)、IE8-事件没有target
    // 所有的事件都有target，但是Cordova deviceready没有
    // IE9-使用srcElement而不是target
    if (!newEvent.target) {
        newEvent.target = event.srcElement || document;
    }

    // 兼容：Safari 6.0+ Chrome < 28
    // target 不能是文本节点
    if (newEvent.target.nodeType === 3) {
        newEvent.target = event.target.parent;
    }

    return fixHook.filter ? fixHook.filter(newEvent, event) : newEvent;
}

/**
 * 兼容浏览器的添加事件方法
 *
 * @static
 * @param {HTMLElement|HTMLDocument} elem HTML元素
 * @param {string} type 事件类型
 * @param {Function} handle 回调函数
 */
function addEvent(elem, type, handle) {
    if (elem.addEventListener) {
        elem.addEventListener(type, handle, false);
    }
    else {
        elem.attachEvent('on' + type, handle);
    }
}

/**
 * 兼容浏览器的添加解绑方法
 *
 * @static
 * @param {HTMLElement|HTMLDocument} elem HTML元素
 * @param {string} type 事件类型
 * @param {Function} handle 回调函数
 */
function removeEvent(elem, type, handle) {
    if (elem.removeEventListener) {
        elem.removeEventListener(type, handle, false);
    }
    else {
        var name = 'on' + type;

        // IE 6-8解绑事件需要事件存在
        if (elem[name] === undefined) {
            elem[name] = null;
        }

        elem.detachEvent(name, handle);
    }
}

/**
 * 事件操作对象
 *
 * @const
 * @type {Object}
 */
var DOM_EVENT_TOOL = {

    /**
     * 绑定事件
     *
     * @param {Node} elem 元素
     * @param {string} type 事件名字
     * @param {Function} fn 要设置的值
     */
    bind: function (elem, type, fn) {

        var cache = DOM_CACHE_TOOL.get(elem);
        var event = cache.event = cache.event || {};

        if (!cache.proxy) {
            cache.proxy = function (e) {

                e = fix(e);
                var fn = event[e.type];

                if (fn) {
                    fn.call(elem, e);
                }
            };
        }

        if (event[type]) {
            event[type] = fn;
            return;
        }

        event[type] = fn;
        addEvent(elem, type, cache.proxy);
    },

    unbind: function (elem, type) {

        var cache = DOM_CACHE_TOOL.get(elem);
        var event = cache.event = cache.event || {};
        delete event[type];

        if (cache.proxy) {
            removeEvent(elem, type, cache.proxy);
        }
    }
};

/**
 * 判断是否为事件
 *
 * @const
 * @type {RegExp}
 */
var R_EVENT_PREFIX = /^on(\w+)$/i;

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

var DOM_UTIL_SUPPORT = (function () {
    var support = {};

    var div = document.createElement('div');
    div.setAttribute('className', 't');
    div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';

    var a = div.getElementsByTagName('a')[0];
    a.style.cssText = 'top:1px';

    var select = document.createElement('select');
    var opt = select.appendChild(document.createElement('option'));
    var input = div.getElementsByTagName('input')[0];

    // 检测IE67setAttribute和getAttribute函数无法设置和获取非字符串值属性的问题(ie6/7)
    support.getSetAttribute = div.className !== 't';

    // 检测IE678无法通过getAttribute获取style属性的问题
    support.style = /top/.test(a.getAttribute('style'));

    // 检测IE67会自动解析URL的问题（IE67要通过特殊的属性来获取URLgetAttrbute(ele,4)）
    support.hrefNormalized = a.getAttribute('href') === '/a';

    // 检查WebKit下checkbox/radio的默认值为''的问题（其它浏览器为'on'）
    support.checkOn = !!input.value;

    // 检测WebKit和IE6-11下默认选中的option没有被设置selected属性的问题
    support.optSelected = opt.selected;

    // 检测IE6的form下enctype属性对应的prop为encoding的问题
    support.enctype = !!document.createElement('form').enctype;

    // 检测WebKit错误的把disabled的select下的所有option设置为disabled的问题
    select.disabled = true;
    support.optDisabled = !opt.disabled;

    // 检测IE8下 getAttribute('value')返回非法值的问题
    input = document.createElement('input');
    input.setAttribute('value', '');
    support.input = input.getAttribute('value') === '';

    // 检查IE6-11下input在设置为radio后丢失value的问题
    input.value = 't';
    input.setAttribute('type', 'radio');
    support.radioValue = input.value === 't';

    return support;
})();

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

if (!DOM_UTIL_SUPPORT.enctype) {
    PROP_FIX.enctype = 'encoding';
}

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
function setAccessor(node, name, value, isSvg) {

    if (node.nodeType !== 1 || name === 'key' || name === 'ref') {
        return;
    }

    name = name.toLowerCase();

    // 优先处理事件
    if (R_EVENT_PREFIX.test(name)) {
        var type = RegExp.$1;
        value ? DOM_EVENT_TOOL.bind(node, type, value) : DOM_EVENT_TOOL.unbind(node, type);
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

    // 处理IE6-9下,设置input节点的type为'radio'后， 其value值会丢失，需要重置
    if (!DOM_UTIL_SUPPORT.radioValue && name === 'type' && value === 'radio' && node.nodeName === 'INPUT') {
        var val = node.value;

        node.setAttribute('type', value);

        if (val) {
            node.value = val;
        }

        return;
    }

    // IE6-7下全部不使用setAttibute
    if (!DOM_UTIL_SUPPORT.getSetAttribute) {

        if (name === 'value' && node.nodeName === 'INPUT') {
            node.defaultValue = value;
        }

        if ((name === 'width' || name === 'height') && value === '') {
            value = 'auto';
        }

        if (name === 'contenteditable' && value === '') {
            value = false;
        }

        var ret = node.getAttributeNode(name);

        if (!ret) {
            ret = node.ownerDocument.createAttribute(name);
            node.setAttributeNode(ret);
        }

        ret.value = value += '';
        return;
    }

    node.setAttribute(name, value + '');
}
