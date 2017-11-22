/**
 * @file index react兼容库
 * @author zongyu(zongyu@baidu.com)
 */

/* eslint-disable fecs-max-statements*/
var React = {};

/**
 * 对象类型映射
 *
 * @const
 * @inner
 * @type {Object}
 */
var CLASS_2_TYPE = {};

/**
 * 获取对象的原始类型
 *
 * @const
 * @inner
 * @type {Function}
 */
var TO_STRING = CLASS_2_TYPE.toString;

'Boolean Number String Function Array Date RegExp Object Error'.replace(/\w+/g, function (name) {
    CLASS_2_TYPE['[object ' + name + ']'] = name.toLowerCase();
});

/**
 * 获取变量的类型
 *
 * @param {*} obj 要检查的变量
 * @return {string} 类型字符串，对于对象化的内置类型的也返回其原始类型
 */
function type(obj) {

    if (obj == null) {
        return obj + '';
    }

    if (typeof obj === 'object' || typeof obj === 'function') {
        return CLASS_2_TYPE[TO_STRING.call(obj)] || 'object';
    }

    return typeof obj;
}

/**
 * 遍历数组或者对象并执行回调函数
 *
 * @param {Array|Object} obj 遍历对象
 * @param {Function} callback 回调函数
 * @return {Array|Object} 函数返回传入的obj
 */
function each(obj, callback) {

    if (type(obj) === 'array') {

        for (var length = obj.length, i = 0; i < length; i++) {

            var value = callback.call(obj[i], i, obj[i]);
            if (value === false) {
                break;
            }
        }
    }
    else {
        for (var x in obj) {

            if (Object.prototype.hasOwnProperty.call(obj, x)) {

                var v = callback.call(obj[x], x, obj[x]);

                if (v === false) {
                    break;
                }
            }
        }
    }

    return obj;
}

/**
 * 克隆一个朴素对象（不对宿主对象进行检测）
 *
 * @param {*} obj 要克隆的对象
 * @param {boolean} [deep] 是否为深拷贝
 * @return {*} 返回克隆对象
 */
function clone(obj, deep) {

    // 值类型、函数不需要进行复制
    if (obj == null || typeof obj !== 'object') {
        return obj;
    }

    var t = type(obj);

    // number、string、boolean的包装类型和正则表达式直接返回对应的值
    if (R_VALUE.test(t)) {
        return obj.valueOf();
    }

    // 日期不是只读的，需要重新生成一个日期对象
    if (t === 'date') {
        return new Date(+obj);
    }

    // 对于array/error/object需要进行一次遍历赋值
    var ret = t === 'array' ? [] : t === 'error' ? new Error('') : {};

    // IE会为部分Error对象添加一个叫number的字段，默认值为0
    delete ret.number;

    each(obj, function (k, v) {
        ret[k] = deep ? clone(v, true) : v;
    });

    return ret;

}

/**
 * 合并多个对象到第一个对象
 *
 * @param {Object} target 合并目标
 * @param {Object} args 要合并的对象
 * @return {*} 返回target
 */
function extend(target, args) {

    target = target || {};

    // 只传进来target时候直接返回target，添加了不存在参数的性能优化
    if (arguments.length <= 1) {
        return target;
    }

    for (var i = 1; i < arguments.length; i++) {
        args = arguments[i];
        if (args != null) {
            for (var name in args) {
                if (Object.prototype.hasOwnProperty.call(args, name) && args[name] !== undefined) {
                    target[name] = args[name];
                }
            }
        }
    }

    return target;
}

/**
 * 在下一个时间周期运行任务
 *
 * @inner
 * @param {Function} fn 要运行的任务函数
 */
function defer(fn) {

    if (typeof Promise !== 'undefined') {
        Promise.resolve().then(fn);
    }
    else if (typeof MutationObserver === 'function') {

        var num = 1;
        var observer = new MutationObserver(fn);
        var text = document.createTextNode(num + '');

        observer.observe(text, {
            characterData: true
        });

        text.data = ++num + '';
    }
    else if (typeof setImmediate === 'function') {
        setImmediate(fn);
    }
    else {
        setTimeout(fn, 0);
    }
}

/**
 * 截取字符串函数
 *
 * @type {Function}
 */
var slice = [].slice;

/**
 * DOM操作函数
 *
 * @inner
 * @type {Object}
 */
var dom = {};

/**
 * 虚拟DOM节点（使用函数直接定义，提高效率）
 *
 * @class VNode
 * @param {string|Function} nodeName 节点的名字，用户自定义的节点名字使用函数
 * @param {Object<string>=} attributes 节点的属性
 * @param {Array<VNode>} children 节点的全部孩子，叶子节点孩子为空
 * @constructor
 */
function VNode(nodeName, attributes, children) {

    /**
     * 节点的名字，用户自定义的节点名字使用函数
     *
     * @public
     * @type {string|Function}
     */
    this.nodeName = nodeName;

    /**
     * 节点的全部属性
     *
     * @public
     * @type {Object<string>}
     */
    this.attributes = attributes;

    /**
     * 节点的全部孩子，叶子节点孩子为空
     *
     * @public
     * @type {Array<VNode>}
     */
    this.children = children;

    /**
     * 节点的key，用于同行元素DIFF时，决定顺序
     *
     * @public
     * @type {string}
     */
    this.key = attributes && attributes.key;

    /**
     * 节点的引用属性
     *
     * @public
     * @type {Function}
     */
    this.ref = attributes && attributes.ref;

    /**
     * 节点的组件
     *
     * @type {Component}
     */
    this.component = null;
}

/**
 * 创建一个虚拟DOM节点
 *
 * @param {string|Function} nodeName 节点的名字，用户自定义的节点名字使用函数
 * @param {Object<string>=} attributes 节点的属性
 * @param {...Object} stack 全部子节点
 * @return {VNode} 返回一个VNode节点
 */
function h(nodeName, attributes, stack) {

    stack = slice.call(arguments, 2);

    var children = [];

    if (attributes && attributes.children) {

        // 如果通过参数传递了孩子，则不再使用参数传递
        if (!stack.length) {
            stack.push(attributes.children);
        }

        delete attributes.children;
    }

    var simple = false;
    var lastSimple = false;

    while (stack.length) {

        var child = stack.shift();
        var ctype = type(child);

        if (ctype === 'array') {
            stack.unshift.apply(stack, child);
        }
        else if (child != null && ctype !== 'boolean') {

            if (ctype === 'number') {
                child = child + '';
            }

            simple = ctype === 'string';

            if (simple && lastSimple) {
                children[children.length - 1] += child;
            }
            else {
                children.push(child);
                lastSimple = simple;
            }
        }
    }

    return new VNode(nodeName, attributes || undefined, children);
}

/**
 * 复制一个VNode节点
 *
 * @param {VNode} vnode 节点
 * @param {Object<string>=} props 全部新增属性
 * @param {...Object} children 全部子节点
 * @return {VNode}
 */
function cloneElement(vnode, props, children) {

    children = slice.call(arguments, 2);

    return h(
        vnode.nodeName,
        extend(clone(vnode.attributes), props),
        children.length ? children : vnode.children
    );
}

/**
 *判断一个节点是否是函数式组件
 *
 * @param {VNode} vnode 虚拟DOM节点
 * @return {boolean}
 */
function isFunctionalComponent(vnode) {
    var nodeName = vnode && vnode.nodeName;
    return nodeName && type(nodeName) === 'function' && !(nodeName.prototype && nodeName.prototype.render);
}

/**
 * 获取节点的属性
 *
 * @param {VNode} vnode 虚拟DOM
 * @return {Object}
 */
function getNodeProps(vnode) {

    var defaultProps = vnode.nodeName.defaultProps;
    var props = extend({}, defaultProps, vnode.attributes);

    if (vnode.children) {
        props.children = vnode.children;
    }

    return props;
}

/**
 * 组件的渲染类型
 *
 * @enum
 * @type {Object}
 */
var COMPONENT_RENDER_WAYS = {
    NO_RENDER: 0,
    SYNC_RENDER: 1,
    FORCE_RENDER: 2,
    ASYNC_RENDER: 3
};

/**
 * 组件基类
 *
 * @param {Object=} props 组件的属性
 * @param {*} context 组件的上下文
 * @constructor
 * @class Component
 */
function Component(props, context) {

    /**
     * 组件的上下文
     *
     * @public
     * @type {Object}
     */
    this.context = context;

    /**
     * 组件的属性
     *
     * @public
     * @type {Object}
     */
    this.props = props;

    /**
     * 组件的状态
     *
     * @public
     * @type {Object}
     */
    this.state = this.state || {};

    /**
     * 渲染回调函数列表
     *
     * @type {Array}
     * @public
     * @inner
     */
    this.renderCallbacks = [];

    /**
     * 之前的属性
     *
     * @inner
     * @public
     * @type {null}
     */
    this.prevProps = null;

    /**
     * 之前的状态
     *
     * @inner
     * @public
     * @type {null}
     */
    this.prevState = null;

    /**
     * 之前的上下文
     *
     * @inner
     * @public
     * @type {null}
     */
    this.prevContext = null;

    /**
     * 组件是否被禁用
     *
     * @inner
     * @public
     * @type {boolean}
     */
    this.disabled = false;

    /**
     * 组件是否需要更新
     *
     * @inner
     * @public
     * @type {boolean}
     */
    this.dirty = false;
}

/**
 * 设置组件的状态
 *
 * @public
 * @param {Object|Function} state 状态对象
 * @param {Function} callback 更新回调
 */
Component.prototype.setState = function (state, callback) {

    var s = this.state;

    if (!this.prevState) {
        this.prevState = clone(s);
    }

    extend(s, type(state) === 'function' ? state(s, this.props) : state);

    if (callback) {
        this.renderCallbacks.push(callback);
    }

    enqueueRender(this);
};

/**
 * 重绘组件
 *
 * @public
 */
Component.prototype.forceUpdate = function forceUpdate() {
    renderComponent(this, COMPONENT_RENDER_WAYS.FORCE_RENDER);
};

/**
 * 组件渲染前的生命周期
 *
 * @public
 * @abstract
 */
Component.prototype.componentWillMount = function () {
};

/**
 * 组件的渲染函数
 *
 * @public
 * @abstract
 * @param {Object} props 组件的属性
 * @param {Object} state 组件的状态
 * @param {Object} context 组件的上下文
 * @return {VNode}
 */
Component.prototype.render = function (props, state, context) {
};

/**
 * 组件渲染后的生命周期
 *
 * @public
 * @abstract
 */
Component.prototype.componentDidMount = function () {
};

/**
 * 组件的获取新属性时执行
 *
 * @public
 * @abstract
 * @param {Object} props 组件的属性
 * @param {Object} context 组件的上下文
 */
Component.prototype.componentWillReceiveProps = function (props, context) {
};

/**
 * 返回一个boolean值用于判断组件是否需要重新渲染
 *
 * @abstract
 * @param {Object} nextProps 新属性
 * @param {Object} nextState 新状态
 * @param {Object} nextContext 新上下文
 * @return {boolean}
 */
Component.prototype.shouldComponentUpdate = function (nextProps, nextState, nextContext) {
    return true;
};

/**
 * 组件的更新前生命周期
 *
 * @public
 * @abstract
 * @param {Object} props 组件的属性
 * @param {Object} state 组件的状态
 * @param {Object} context 组件的上下文
 */
Component.prototype.componentWillUpdate = function (props, state, context) {
};

/**
 * 组件的更新后生命周期
 *
 * @public
 * @abstract
 * @param {Object} previousProps 组件的属性
 * @param {Object} previousState 组件的状态
 * @param {Object} previousContext 组件的上下文
 * @return {VNode}
 */
Component.prototype.componentDidUpdate = function (previousProps, previousState, previousContext) {
};

/**
 * 组件卸载前的生命周期
 *
 * @public
 * @abstract
 */
Component.prototype.componentWillUnmount = function () {
};

/**
 * 组件卸载后的生命周期
 *
 * @public
 * @abstract
 */
Component.prototype.componentDidUnmount = function () {
};

/**
 * 组件渲染队列
 *
 * @type {Array}
 */
var COMPONENT_RENDER_QUERY = [];

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
 * 当前是否处理Svg模式之中
 *
 * @inner
 * @type {boolean}
 */
var isSvgMode = false;

/**
 * 当前的DIFF等级，为0的时候，是基准DIFF，不然是子流程
 *
 * @inner
 * @type {number}
 */
var diffLevel = 0;

/**
 * 需要执行componentDidMount函数的组件，一次DIFF只执行一次
 *
 * @const
 * @type {Array}
 */
var DIFF_COMPONENT_MOUNTS = [];

/**
 * 执行componentDidMount函数
 *
 * @inner
 */
function flushMounts() {

    var c;
    while ((c = DIFF_COMPONENT_MOUNTS.pop())) {
        c.componentDidMount();
    }
}

/**
 * 将组建添加到更新队列
 *
 * @param {Component} component 组件
 */
function enqueueRender(component) {
    if (!component.dirty && (component.dirty = true) && COMPONENT_RENDER_QUERY.push(component) === 1) {
        defer(rerender);
    }
}

/**
 * 重绘组件
 *
 * @inner
 */
function rerender() {

    // 重新生成一个队列，清空旧队列
    var list = COMPONENT_RENDER_QUERY.slice(0);
    COMPONENT_RENDER_QUERY.length = 0;

    var p;
    while ((p = list.pop())) {
        if (p.dirty) {
            renderComponent(p);
        }
    }
}

/**
 * 将组建添加到更新队列
 *
 * @param {Component} component 组件
 * @param {COMPONENT_RENDER_WAYS=} way 组件的渲染方法
 * @param {boolean=} isChild 是否子组件
 */
function renderComponent(component, way, isChild) {

    if (component.disabled) {
        return;
    }

    // 还原之前的属性
    var props = component.props;
    var state = component.state;
    var context = component.context;
    var previousProps = component.prevProps || props;
    var previousState = component.prevState || state;
    var previousContext = component.prevContext || context;

    var skip;
    var rendered;

    var isUpdate = component.base;
    var nextBase = component.nextBase;
    var initialBase = isUpdate || nextBase;
    var initialChildComponent = component.childComponent;
    var inst;
    var cbase;

    if (isUpdate) {

        component.props = previousProps;
        component.state = previousState;
        component.context = previousContext;

        if (way !== COMPONENT_RENDER_WAYS.FORCE_RENDER
            && component.shouldComponentUpdate(props, state, context) === false) {
            skip = true;
        }
        else {
            component.componentWillUpdate(props, state, context);
        }

        component.props = props;
        component.state = state;
        component.context = context;
    }

    component.prevProps = component.prevState = component.prevContext = component.nextBase = null;
    component.dirty = false;

    if (!skip) {
        if (component.render) {
            rendered = component.render(props, state, context);
        }

        // context to pass to the child, can be updated via (grand-)parent component
        if (component.getChildContext) {
            context = extend({}, context, component.getChildContext());
        }

        while (isFunctionalComponent(rendered)) {
            rendered = rendered.nodeName(getNodeProps(rendered), context || {});
        }

        var childComponent = rendered && rendered.nodeName;
        var toUnmount;
        var base;

        if (type(childComponent) === 'function') {

            var childProps = getNodeProps(rendered);
            inst = initialChildComponent;

            if (inst && inst.constructor === childComponent && childProps.key === inst.key) {
                setComponentProps(inst, childProps, COMPONENT_RENDER_WAYS.SYNC_RENDER, context);
            }
            else {

                toUnmount = inst;
                inst = new childComponent(childComponent, childProps, context);
                inst.nextBase = inst.nextBase || nextBase;
                inst.parentComponent = component;
                component.childComponent = inst;
                setComponentProps(inst, childProps, COMPONENT_RENDER_WAYS.NO_RENDER, context);
                renderComponent(inst, COMPONENT_RENDER_WAYS.SYNC_RENDER, true);
            }

            base = inst.base;
        }
        else {
            cbase = initialBase;
            toUnmount = initialChildComponent;

            if (toUnmount) {
                cbase = component._component = null;
            }

            if (initialBase || way === COMPONENT_RENDER_WAYS.SYNC_RENDER) {
                if (cbase) {
                    cbase._component = null;
                }
                base = diff(cbase, rendered, context, initialBase && initialBase.parentNode);
            }
        }

        if (initialBase && base !== initialBase && inst !== initialChildComponent) {
            var baseParent = initialBase.parentNode;
            if (baseParent && base !== baseParent) {
                baseParent.replaceChild(base, initialBase);

                if (!toUnmount) {
                    initialBase._component = null;
                    recollectNodeTree(initialBase);
                }
            }
        }

        if (toUnmount) {
            unmountComponent(toUnmount, base !== initialBase);
        }

        component.base = base;

        if (base && !isChild) {

            var componentRef = component;
            var t = component;

            while ((t = t._parentComponent)) {
                (componentRef = t).base = base;
            }
            base._component = componentRef;
            base._componentConstructor = componentRef.constructor;
        }
    }

    if (!isUpdate) {
        DIFF_COMPONENT_MOUNTS.unshift(component);
    }
    else if (!skip) {
        component.componentDidUpdate(previousProps, previousState, previousContext);
    }

    var cb = component.renderCallbacks;

    if (cb) {
        var fn;

        while ((fn = cb.pop())) {
            fn.call(component);
        }
    }

    if (!diffLevel && !isChild) {
        flushMounts();
    }
}

/**
 * 渲染虚拟DOM到容器内部
 *
 * @param {VNode} vnode 虚拟DOM
 * @param {Node} container 父容器组件
 * @param {Object} context diff使用的上下文
 * @return {Node} 返回渲染的元素
 */
function render(vnode, container, context) {
    return diff(container.lastChild, vnode, context, container, false);
}

/**
 * 组件DIFF函数
 *
 * @param {Node} node 真实元素
 * @param {VNode} vnode 虚拟DOM
 * @param {Object} context diff使用的上下文
 * @param {Node} container 父容器组件
 * @param {boolean} componentRoot 是否组件
 * @return {Node} DIFF之后的新DOM
 */
function diff(node, vnode, context, container, componentRoot) {

    if (!diffLevel++) {
        isSvgMode = container && typeof container.ownerSVGElement !== 'undefined';
    }

    var out = idiff(node, vnode, context);

    if (container && out.parentNode !== container) {
        container.appendChild(out);
    }

    if (!--diffLevel && !componentRoot) {
        flushMounts();
    }

    return out;
}

/**
 * diff一个节点
 *
 * @param {Node} node 真实元素
 * @param {VNode|string} vnode 虚拟DOM
 * @param {Object} context diff使用的上下文
 * @return {Node}
 */
function idiff(node, vnode, context) {

    var ref = vnode && vnode.ref;

    // 对于函数式组件，可以直接处理掉，加快效率
    while (isFunctionalComponent(vnode)) {
        vnode = vnode.nodeName(getNodeProps(vnode), context || {});
    }

    // 用字符串替代空值
    if (vnode == null) {
        vnode = '';
    }

    // 处理字符串
    if (type(vnode) === 'string') {

        if (node && node.nodeType === 3) {
            node.nodeValue = vnode;
        }
        else {
            recollectNodeTree(node);
            node = document.createTextNode(vnode);
        }

        return node;
    }

    // 如果节点是个组件，则走组件DIFF
    if (type(vnode.nodeName) === 'function') {
        return buildComponentFromVNode(node, vnode, context);
    }

    var out = node;
    var nodeName = vnode.nodeName + '';
    var prevSvgMode = isSvgMode;

    // 随时判断当前是不是SVG组件
    isSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode;

    if (!node || node.nodeName !== nodeName.toUpperCase()) {

        out = isSvgMode
            ? document.createElementNS('http://www.w3.org/2000/svg', nodeName)
            : document.createElement(nodeName);

        if (node && node.parentNode) {
            node.parentNode.replaceChild(out, node);
        }

        recollectNodeTree(node);
    }

    var attr = out[ATTR_KEY];

    if (!attr) {
        out[ATTR_KEY] = attr = uuid++;
    }

    var old = VNODE_INSTANCE_MAP[attr] || {};
    VNODE_INSTANCE_MAP[attr] = vnode;

    // DIFF组件的孩子
    innerDiffNode(out, vnode.children, old.children, context);

    // DIFF组件的属性
    diffAttributes(out, vnode.attributes, old.attributes);

    ref && ref(out);

    isSvgMode = prevSvgMode;

    return out;
}

/**
 * DIFF节点的属性，并进行设置
 *
 * @param {Node} node 元素
 * @param {Object} attrs 新属性
 * @param {Object} old 旧属性
 */
function diffAttributes(node, attrs, old) {

    // 如果存在旧属性，先删除不需要的旧属性
    each(old, function (name) {
        if (!(attrs && name in attrs) && old[name] != null) {
            setAccessor(node, name, null, isSvgMode);
        }
    });

    // 添加新属性
    each(attrs, function (name, value) {
        if (name !== 'children' && name !== 'innerHTML' && !(old && old[name] === value)) {
            setAccessor(node, name, attrs[name], isSvgMode);
        }
    });
}

/**
 * DIFF子节点
 *
 * @param {Node} container 父容器
 * @param {Array} vnode 新节点
 * @param {Array} old 旧节点
 * @param {Object} context diff使用的上下文
 */
function innerDiffNode(container, vnode, old, context) {

    var elems = container.childNodes;
    var keyed = {};
    var left = [];
    var len = elems.length;

    each(old, function (i, vnode) {

        if (vnode.key) {
            keyed[vnode.key] = elems[i];
        }
        else {
            left.push(elems[i]);
        }
    });

    each(vnode, function (i, vnode) {
        var key = vnode.key;
        var elem = keyed[key] || left.shift();
        keyed[key] = null;
        var child = idiff(elem, vnode, context);

        if (i >= len) {
            container.appendChild(child);
        }
        else if (child !== elems[i]) {
            container.insertBefore(child, elems[i]);
        }
    });

    // 清除所有无用的节点
    each(keyed, function (i, item) {
        recollectNodeTree(item);
    });

    each(left, function (i, item) {
        recollectNodeTree(item);
    });
}

/**
 * 编译一个组件
 *
 * @param {Node} node 元素
 * @param {VNode|string} vnode 虚拟DOM
 * @param {Object} context diff使用的上下文
 * @return {Node}
 */
function buildComponentFromVNode(node, vnode, context) {


    // 首先获取到旧的节点
    var attr = node && node[ATTR_KEY] || uuid++;
    var old = VNODE_INSTANCE_MAP[attr] || {};
    var component = old.component;
    var original = component;

    // 是否同一个节点
    var isDirectOwner = component && old.nodeName === vnode.nodeName;
    var isOwner = isDirectOwner;

    // 递归寻找直接组件
    while (component && !isOwner && (component = component.parentComponent)) {
        isOwner = component.constructor === vnode.nodeName;
    }

    var props = getNodeProps(vnode);

    var oldNode = node;

    // 组件可以更新的情况
    if (component && isOwner) {
        setComponentProps(component, props, COMPONENT_RENDER_WAYS.ASYNC_RENDER, context);
        node = component.base;
    }
    // 组件不可以更新，直接替换
    else {

        if (original && !isDirectOwner) {
            unmountComponent(original);
            node = oldNode = null;
        }

        component = new vnode.nodeName(props, context);

        if (node && !component.nextBase) {
            component.nextBase = node;
            oldNode = null;
        }

        setComponentProps(component, props, COMPONENT_RENDER_WAYS.SYNC_RENDER, context);
        node = component.base;

        if (oldNode && node !== oldNode) {
            recollectNodeTree(oldNode);
        }
    }

    // 重新缓存节点
    VNODE_INSTANCE_MAP[attr] = vnode;
    vnode.component = component;

    return node;
}

/**
 * 释放一个节点
 *
 * @param {Node} elem 元素
 */
function recollectNodeTree(elem) {

    if (!elem) {
        return;
    }

    var attr = elem[ATTR_KEY];
    var vnode = VNODE_INSTANCE_MAP[attr] || {};

    var component = vnode.component;

    if (component) {
        unmountComponent(component);
        return;
    }

    if (vnode.ref) {
        vnode.ref(null);
    }

    if (elem && elem.parentNode) {
        elem.parentNode.removeChild(elem);
    }

    var c;
    while ((c = elem.lastChild)) {
        recollectNodeTree(c);
    }
}

/**
 * 销毁一个组件
 *
 * @param {Component} component 组件
 */
function unmountComponent(component) {

    // TODO childComponent问题没处理
    var elem = component.base;
    component.disabled = true;
    component.componentWillUnmount();
    component.base = null;

    var inner = component.childComponent;

    if (inner) {
        unmountComponent(inner);
    }
    else if (elem) {

        var attr = elem[ATTR_KEY];
        var vnode = VNODE_INSTANCE_MAP[attr] || {};

        if (vnode.ref) {
            vnode.ref(null);
        }

        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }

        var c;
        while ((c = elem.lastChild)) {
            recollectNodeTree(c);
        }
    }

    if (component.ref) {
        component.ref(null);
    }

    component.componentDidUnmount();
}

function setComponentProps(component, props, way, context) {

    if (component.disabled) {
        return;
    }

    component.disabled = true;

    if ((component.ref = props.ref)) {
        delete props.ref;
    }
    if ((component.key = props.key)) {
        delete props.key;
    }

    if (!component.base) {
        component.componentWillMount();
    }
    else if (component.componentWillReceiveProps) {
        component.componentWillReceiveProps(props, context);
    }

    if (context && context !== component.context) {

        if (!component.prevContext) {
            component.prevContext = component.context;
        }

        component.context = context;
    }

    if (!component.prevProps) {
        component.prevProps = component.props;
    }

    component.props = props;

    component.disabled = false;

    if (way !== COMPONENT_RENDER_WAYS.NO_RENDER) {
        if (way === COMPONENT_RENDER_WAYS.SYNC_RENDER || !component.base) {
            renderComponent(component, COMPONENT_RENDER_WAYS.SYNC_RENDER);
        }
        else {
            enqueueRender(component);
        }
    }

    if (component.ref) {
        component.ref(component);
    }
}

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
 * React属性到原生属性的映射
 *
 * @const
 * @type {Object}
 */
var PROP_ALIAS = {
    className: 'class',
    htmlFor: 'for'
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

            var c = new nodeName(props, context);
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

    each(attributes, function (name, v) {

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

// 暴露所有可用的接口
React.util = {
    type: type,
    each: each,
    clone: clone,
    extend: extend,
    defer: defer
};

React.VNode = VNode;
React.h = React.createElement = h;
React.cloneElement = cloneElement;
React.Component = Component;
React.render = render;
React.renderToString = renderToString;

/* eslint-enable fecs-max-statements, babel/new-cap*/
