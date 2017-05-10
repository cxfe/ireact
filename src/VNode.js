/**
 * @file VNode 虚拟DOM节点
 * @author zongyu(zongyu@baidu.com)
 */

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
        extend({}, vnode.attributes, props),
        children.length ? children : vnode.children
    );
}

