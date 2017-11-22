/**
 * @file h.spec h函数测试
 * @author zongyu(zongyu@baidu.com)
 */

define(function (require) {

    var h = require('ireact').h;
    var VNode = require('ireact').VNode;

    /* eslint-disable max-nested-callbacks*/
    describe('h函数检测', function () {

        /**
         * 用于检测一个对象是否是一个符合规则的VNode对象
         *
         * @param {VNode} node 节点
         * @param {string|Function} name 节点的名字
         * @param {Object} attributes 节点的属性列表
         * @param {Array} children 子节点
         * @param {string} key 节点的key
         */
        function checkVNode(node, name, attributes, children, key) {

            expect(typeof node).toBe('object');
            expect(node instanceof VNode).toBe(true);
            expect(node.nodeName).toBe(name);
            expect(node.attributes).toEqual(attributes);
            expect(node.children).toEqual(children);
            expect(node.key).toBe(key);
        }

        it('函数的返回结果应当是VNode', function () {
            checkVNode(h('foo'), 'foo', undefined, [], undefined);
        });

        it('属性要保持不变', function () {

            var attrs = {
                foo: 'bar',
                baz: 10,
                func: function () {

                }
            };

            checkVNode(h('foo', attrs), 'foo', attrs, [], undefined);
        });

        it('应当支持节点孩子', function () {

            var bar = h('bar');
            var baz = h('baz');
            var r = h('foo', null, bar, baz);

            checkVNode(r, 'foo', undefined, [bar, baz], undefined);
        });

        it('支持使用元素给出参数', function () {
            var bar = h('bar');
            var baz = h('baz', null, h('test'));
            var r = h('foo', null, bar, baz);

            checkVNode(r, 'foo', undefined, [bar, baz], undefined);
        });

        it('支持使用数组给出参数', function () {

            var bar = h('bar');
            var baz = h('baz', null, h('test'));
            var r = h('foo', null, [bar, baz]);

            checkVNode(r, 'foo', undefined, [bar, baz], undefined);
        });

        it('支持同时使用元素和数组给出参数', function () {

            var bar = h('bar');
            var baz = h('baz', null, h('test'));
            var r = h('foo', null, bar, [baz]);

            checkVNode(r, 'foo', undefined, [bar, baz], undefined);
        });

        it('参数组合测试', function () {
            var a = h('a');
            var b = h('b');
            var c = h('c');
            var d = h('d');

            checkVNode(h('foo', null, a, b, c, d), 'foo', undefined, [a, b, c, d], undefined);
            checkVNode(h('foo', null, a, [b, c], d), 'foo', undefined, [a, b, c, d], undefined);
            checkVNode(h('foo', null, [a, [b, c], d]), 'foo', undefined, [a, b, c, d], undefined);
            checkVNode(h('foo', {
                children: [a, [b, c], d]
            }), 'foo', {}, [a, b, c, d], undefined);
            checkVNode(h('foo', {
                children: a
            }), 'foo', {}, [a], undefined);
            checkVNode(h('foo', {
                children: a
            }, b, c, d), 'foo', {}, [b, c, d], undefined);
        });

        it('应当支持文本子节点', function () {
            checkVNode(h('foo', null, 'textstuff'), 'foo', undefined, ['textstuff'], undefined);
        });

        it('应当合并文本子节点', function () {

            var bar = h('bar');
            checkVNode(h('foo', null, [
                'one',
                'two',
                bar,
                'three',
                bar,
                bar,
                'four',
                null,
                'five',
                'six'
            ]), 'foo', undefined, [
                'onetwo',
                bar,
                'three',
                bar,
                bar,
                'fourfivesix'
            ], undefined);
        });

        it('应当合并相邻文本子节点', function () {

            checkVNode(h('foo', null, [
                'one',
                ['two', null, 'three'],
                null,
                ['four', null, 'five', null],
                'six',
                null
            ]), 'foo', undefined, [
                'onetwothreefourfivesix'
            ], undefined);
        });

        it('不应当处理boolean值', function () {

            checkVNode(h('foo', null, [
                'one',
                true,
                'two',
                false,
                'three'
            ]), 'foo', undefined, [
                'onetwothree'
            ], undefined);
        });

    });
    /* eslint-enable max-nested-callbacks*/
});
