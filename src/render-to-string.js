/**
 * @file render-to-string 渲染成字符串
 * @author zongyu(zongyu@baidu.com)
 */

/**
 * HTML转义字符
 *
 * @const
 * @type {Object}
 */
var ESC = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '&': '&amp;'
};

/**
 * 判断是否为自结束节点
 *
 * @const
 * @type {RegExp}
 */
var R_SELF_CLOSE = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;

/**
 * HTML转义函数
 *
 * @param {string} str 要转义的字符串
 * @return {string}
 */
function encodeEntities(str) {
    return (str + '').replace(/[<>"&]/g, function (a) {
        return ESC[a];
    });
}

/**
 * 创建属性字段
 *
 * @param {string} name 属性的名字
 * @param {*} value 属性的值
 * @return {string}
 */
function formatAttribute(name, value) {

    name = PROP_ALIAS[name] || name;

    if (value == null || value === false) {
        return '';
    }
    else if (value === '' || value === true) {
        return ' ' + name;
    }

    if (name === 'class' && value && typeof value === 'object') {
        value = hashToClassName(value);
    }

    if (name === 'style' && value && typeof value === 'object') {
        value = styleObjToCss(value);
    }

    return ' ' + name + '="' + encodeEntities(value) + '"';
}

/**
 * 渲染成字符串
 *
 * @param {VNode|string} vnode 虚拟DOM
 * @param {Object=} context diff使用的上下文
 * @param {boolean=} isSvgMode 是否在SVG里面
 * @return {string}
 */
function renderToString(vnode, context, isSvgMode) {

    // 空节点
    if (vnode == null || vnode === false) {
        return '';
    }

    var nodeName = vnode.nodeName;
    var attributes = vnode.attributes;
    var children = vnode.children;

    context = context || {};

    // 文本节点
    if (!nodeName) {
        return encodeEntities(vnode);
    }

    // 组件
    if (typeof nodeName === 'function') {

        var props = getNodeProps(vnode);
        var rendered;

        // 函数式组件
        if (isFunctionalComponent(vnode)) {
            rendered = nodeName(props, context);
        }
        // 类式组件
        else {

            /* eslint-disable babel/new-cap*/
            var c = new nodeName(props, context);
            /* eslint-enable babel/new-cap*/
            c.props = props;
            c.context = context;
            c.componentWillMount();

            rendered = c.render(c.props, c.state, c.context);

            if (c.getChildContext) {
                context = extend({}, context, c.getChildContext());
            }
        }

        return renderToString(rendered, context);
    }

    // 一般的字符串标签
    var s = '';
    var html;

    each(attributes || {}, function (name, v) {

        // 空/函数属性/子元素属性/重复的class和for属性不进行多次渲染
        if (v == null || type(v) === 'function' || name === 'children' || PROP_ALIAS[name] in attributes) {
            return '';
        }

        // 处理svg元素不写:的问题
        if (isSvgMode && name.match(/^xlink:?(.+)/)) {
            name = name.toLowerCase().replace(/^xlink:?(.+)/, 'xlink:$1');
        }

        if (name === 'dangerouslySetInnerHTML') {
            html = v && v.__html;
            return;
        }

        s += formatAttribute(name, v);
    });

    s = '<' + nodeName + s + '>';

    if (html) {
        s += html;
    }
    else {
        each(children, function (i, child) {

            if (child != null && child !== false) {
                var childSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode;
                s += renderToString(child, context, childSvgMode);
            }
        });
    }

    if (!R_SELF_CLOSE.test(nodeName)) {
        s += '</' + nodeName + '>';
    }

    return s;
}

React.renderToString = renderToString;

