/**
 * @file lang.spec 语言函数测试
 * @author zongyu(zongyu@baidu.com)
 */


define(function (require) {

    var util = require('ireact').util;
    var type = util.type;
    var each = util.each;
    var extend = util.extend;

    /* eslint-disable max-nested-callbacks*/
    describe('lang.type检测', function () {

        it('null', function () {
            expect(type(null)).toBe('null');
        });

        it('undefined', function () {
            expect(type(undefined)).toBe('undefined');
        });

        it('Boolean', function () {
            var MyBoolean = Boolean;
            expect(type(true)).toBe('boolean');
            expect(type(false)).toBe('boolean');
            expect(type(Boolean(true))).toBe('boolean');
            expect(type(new MyBoolean(true))).toBe('boolean');
        });

        it('Number', function () {
            var MyNumber = Number;
            expect(type(0)).toBe('number');
            expect(type(1)).toBe('number');
            expect(type(Number(1))).toBe('number');
            expect(type(new MyNumber(1))).toBe('number');
        });

        it('String', function () {
            var MyString = String;
            expect(type('')).toBe('string');
            expect(type('a')).toBe('string');
            expect(type(String('a'))).toBe('string');
            expect(type(new MyString('a'))).toBe('string');
        });

        it('Object', function () {
            var MyObject = Object;
            expect(type({})).toBe('object');
            expect(type(new MyObject())).toBe('object');
        });

        it('RegExp', function () {
            expect(type(/foo/)).toBe('regexp');
            expect(type(new RegExp('asdf'))).toBe('regexp');
        });

        it('Array', function () {
            expect(type([1])).toBe('array');
        });

        it('Date', function () {
            expect(type(new Date())).toBe('date');
        });

        it('Function', function () {
            expect(type(new Function('return;'))).toBe('function');
            expect(type(function () {
            })).toBe('function');
        });

        it('Error', function () {
            expect(type(new Error())).toBe('error');
        });

        it('Window', function () {
            expect(type(window)).toBe('object');
        });

        it('Document', function () {
            expect(type(document)).toBe('object');
        });

        it('Element', function () {
            expect(type(document.body)).toBe('object');
        });

        it('TextNode', function () {
            expect(type(document.createTextNode('foo'))).toBe('object');
        });

        it('NodeList', function () {
            expect(type(document.getElementsByTagName('*'))).toBe('object');
        });

    });

    describe('lang.each检测', function () {

        it('数组遍历', function () {
            var seen = {};

            each([3, 4, 5], function (k, v) {
                seen[k] = v;
            });

            expect(seen).toEqual({0: 3, 1: 4, 2: 5});
        });

        it('对象遍历', function () {
            var seen = {};

            each({name: 'name', lang: 'lang'}, function (k, v) {
                seen[k] = v;
            });

            expect(seen).toEqual({name: 'name', lang: 'lang'});
        });

        it('跳出遍历的数组', function () {
            var seen = [];

            each([1, 2, 3], function (k, v) {
                seen.push(v);
                if (k === 1) {
                    return false;
                }
            });

            expect(seen).toEqual([1, 2]);
        });

        it('跳出遍历的对象', function () {
            var seen = [];

            each({a: 1, b: 2, c: 3}, function (k, v) {
                seen.push(v);
                return false;
            });

            expect(seen).toEqual([1]);
        });

    });

    describe('lang.extend检测', function () {

        var settings = {xnumber1: 5, xnumber2: 7, xstring1: 'peter', xstring2: 'pan'};
        var options = {xnumber2: 1, xstring2: 'x', xxx: 'newstring'};
        var optionsCopy = {xnumber2: 1, xstring2: 'x', xxx: 'newstring'};
        var merged = {xnumber1: 5, xnumber2: 1, xstring1: 'peter', xstring2: 'x', xxx: 'newstring'};
        extend(settings, null, options);

        it('检查合并的结果是否正常', function () {
            expect(settings).toEqual(merged);
        });

        it('检查合并不会对除第一个之外的元素产生影响', function () {
            expect(options).toEqual(optionsCopy);
        });

        it('检查值为null的元素可以被合并', function () {
            var nullUndef = extend({}, options, {xnumber2: null});
            expect(nullUndef.xnumber2).toBeNull();
        });

        it('检查值为undefined的元素不会被合并', function () {
            var nullUndef = extend({}, options, {xnumber2: undefined});
            expect(nullUndef.xnumber2).toBe(options.xnumber2);
        });

        it('检查值为null的元素可以被正确的插入', function () {
            var nullUndef = extend({}, options, {xnumber0: null});
            expect(nullUndef.xnumber0).toBeNull();
        });

        function func() {
        }

        extend(func, {key: 'value'});

        it('检查函数可以被正确的扩展', function () {
            expect(func.key).toBe('value');
        });

        it('检查多元素合并', function () {
            var defaults = {xnumber1: 5, xnumber2: 7, xstring1: 'peter', xstring2: 'pan'};
            var defaultsCopy = {xnumber1: 5, xnumber2: 7, xstring1: 'peter', xstring2: 'pan'};
            var options1 = {xnumber2: 1, xstring2: 'x'};
            var options1Copy = {xnumber2: 1, xstring2: 'x'};
            var options2 = {xstring2: 'xx', xxx: 'newstringx'};
            var options2Copy = {xstring2: 'xx', xxx: 'newstringx'};
            var merged2 = {xnumber1: 5, xnumber2: 1, xstring1: 'peter', xstring2: 'xx', xxx: 'newstringx'};
            var settings = extend({}, defaults, options1, options2);

            expect(settings).toEqual(merged2);
            expect(defaults).toEqual(defaultsCopy);
            expect(options1).toEqual(options1Copy);
            expect(options2).toEqual(options2Copy);
        });
    });
    /* eslint-enable max-nested-callbacks*/
});
