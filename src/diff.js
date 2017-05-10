/**
 * @file diff
 * @author zongyu(zongyu@baidu.com)
 */

/**
 * 组件渲染队列
 *
 * @type {Array}
 */
var COMPONENT_RENDER_QUERY = [];

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

    // 是否需要更新组件
    var skip = false;

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

        var rendered = component.render(props, state, context);

        // 处理上下文
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
                cbase = component.childComponent = null;
            }

            if (initialBase || way === COMPONENT_RENDER_WAYS.SYNC_RENDER) {

                if (cbase) {
                    DOM_CACHE_TOOL.set(cbase, 'component', null);
                    DOM_CACHE_TOOL.set(cbase, 'constructor', null);
                }

                base = diff(cbase, rendered, context, initialBase && initialBase.parentNode);
            }
        }

        if (initialBase && base !== initialBase && inst !== initialChildComponent) {

            var baseParent = initialBase.parentNode;

            if (baseParent && base !== baseParent) {

                baseParent.replaceChild(base, initialBase);

                if (!toUnmount) {
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

            while ((t = t.parentComponent)) {
                (componentRef = t).base = base;
            }

            DOM_CACHE_TOOL.set(base, 'component', componentRef);
            DOM_CACHE_TOOL.set(base, 'constructor', componentRef.constructor);
        }
    }

    // 处理组件生成之后的事
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

    if (!node || node.nodeName.toLowerCase() !== nodeName) {

        out = isSvgMode
            ? document.createElementNS('http://www.w3.org/2000/svg', nodeName)
            : document.createElement(nodeName);

        if (node && node.parentNode) {
            node.parentNode.replaceChild(out, node);
        }

        recollectNodeTree(node);
    }

    var old = DOM_CACHE_TOOL.get(out, 'vnode') || {};
    DOM_CACHE_TOOL.set(out, 'vnode', vnode);

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
    each(old || {}, function (name) {
        if (!(attrs && name in attrs) && old[name] != null) {
            setAccessor(node, name, null, isSvgMode);
        }
    });

    // 添加新属性
    each(attrs || {}, function (name, value) {
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

    each(old || [], function (i, vnode) {

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
    var old = DOM_CACHE_TOOL.get(node, 'constructor');
    var component = DOM_CACHE_TOOL.get(node, 'component');
    var original = component;

    // 是否同一个节点
    var isDirectOwner = component && old === vnode.nodeName;
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

    return node;
}

/**
 * 释放一个节点
 *
 * @param {Node} node 元素
 */
function recollectNodeTree(node) {

    if (!node) {
        return;
    }

    if (node.nodeType === 1) {
        var vnode = DOM_CACHE_TOOL.get(node, 'vnode');
        var component = DOM_CACHE_TOOL.get(node, 'component');

        if (component) {
            unmountComponent(component);
            return;
        }

        if (vnode.ref) {
            vnode.ref(null);
        }

        DOM_CACHE_TOOL.clean(node);
    }

    if (node && node.parentNode) {
        node.parentNode.removeChild(node);
    }

    var c;
    while ((c = node.lastChild)) {
        recollectNodeTree(c);
    }
}

/**
 * 销毁一个组件
 *
 * @param {Component} component 组件
 */
function unmountComponent(component) {

    var elem = component.base;
    component.disabled = true;
    component.componentWillUnmount();
    component.base = null;

    var inner = component.childComponent;

    if (inner) {
        unmountComponent(inner);
    }
    else if (elem) {

        var vnode = DOM_CACHE_TOOL.get(elem, 'vnode');

        if (vnode.ref) {
            vnode.ref(null);
        }

        if (elem && elem.parentNode) {
            elem.parentNode.removeChild(elem);
        }

        DOM_CACHE_TOOL.clean(elem);

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

/**
 * 设置组件属性
 *
 * @param {Component} component 组件
 * @param {Object} props 组件的属性
 * @param {COMPONENT_RENDER_WAYS} way 渲染方式
 * @param {*} context 上下文
 */
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
