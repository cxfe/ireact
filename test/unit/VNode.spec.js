/**
 * @file VNode.spec VNode节点构建测试
 * @author zongyu(zongyu@baidu.com)
 */

define(function (require) {

    var VNode = require('ireact').VNode;

    /* eslint-disable max-nested-callbacks*/
    describe('VNode创建检测', function () {

        it('无参数', function () {

            var node = new VNode();

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBeUndefined();
            expect(node.attributes).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(node.key).toBeUndefined();
        });

        it('只传递string的nodeName', function () {

            var node = new VNode('demo');

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe('demo');
            expect(node.attributes).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(node.key).toBeUndefined();
        });

        it('只传递函数的nodeName', function () {

            var noop = function () {

            };

            var node = new VNode(noop);

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe(noop);
            expect(node.attributes).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(node.key).toBeUndefined();
        });

        it('只传递函数的nodeName', function () {

            var noop = function () {

            };

            var node = new VNode(noop);

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe(noop);
            expect(node.attributes).toBeUndefined();
            expect(node.children).toBeUndefined();
            expect(node.key).toBeUndefined();
        });

        it('attributes测试', function () {

            var attr = {};
            var node = new VNode('demo', attr);

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe('demo');
            expect(node.attributes).toBe(attr);
            expect(node.children).toBeUndefined();
            expect(node.key).toBeUndefined();
        });

        it('key测试', function () {

            var attr = {
                key: 'abc'
            };

            var node = new VNode('demo', attr);

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe('demo');
            expect(node.attributes).toBe(attr);
            expect(node.children).toBeUndefined();
            expect(node.key).toBe('abc');
        });

        it('children测试', function () {

            var attr = {
                key: 'abc'
            };
            var children = [];
            var node = new VNode('demo', attr, children);

            expect(typeof +node.id).toBe('number');
            expect(node.nodeName).toBe('demo');
            expect(node.attributes).toBe(attr);
            expect(node.children).toBe(children);
            expect(node.key).toBe('abc');
        });

    });
    /* eslint-enable max-nested-callbacks*/
});
