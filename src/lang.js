/**
 * @file lang 几个基语言函数
 * @author zongyu(zongyu@baidu.com)
 */

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

