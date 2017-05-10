/**
 * @file lang.jquery 基于Jquery的基本语言函数
 * @author zongyu(zongyu@baidu.com)
 */

/**
 * 获取变量的类型
 *
 * @param {*} obj 要检查的变量
 * @return {string} 类型字符串，对于对象化的内置类型的也返回其原始类型
 */
var type = $.type;

/**
 * 遍历数组或者对象并执行回调函数
 *
 * @param {Array|Object} obj 遍历对象
 * @param {Function} callback 回调函数
 * @return {Array|Object} 函数返回传入的obj
 */
var each = $.each;

/**
 * 合并多个对象到第一个对象
 *
 * @param {Object} target 合并目标
 * @param {Object} args 要合并的对象
 * @return {*} 返回target
 */
var extend = $.extend;

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
