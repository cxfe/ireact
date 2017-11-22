/**
 * @file common 通用工具
 * @author zongyu(zongyu@baidu.com)
 */

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
