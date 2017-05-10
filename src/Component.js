/**
 * @file Component 组件类
 * @author zongyu(zongyu@baidu.com)
 */

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
        this.prevState = extend({}, s);
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

