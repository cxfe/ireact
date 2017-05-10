/**
 * @file dom 有兼容性的DOM操作
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
