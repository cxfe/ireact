/**
 * @file basic-render.spec 用于检测不存在组件的情况下，是否可以正常使用
 * @author zongyu(zongyu@baidu.com)
 */


define(function (require) {

    var h = require('ireact').h;
    var render = require('ireact').render;

    /* eslint-disable max-nested-callbacks*/
    describe('render函数基本检测', function () {

        var container;

        beforeEach(function () {
            container = document.createElement('div');
            document.body.appendChild(container)
        });

        afterEach(function () {
            document.body.removeChild(container);
            container = null;
        });

        it('空值渲染', function () {
            var elem = render(null, container);
            expect(elem.nodeType).toBe(3);
            expect(elem.nodeValue).toBe('');
            expect(container.childNodes.length).toBe(1);
            elem = render(undefined, container);
            expect(elem.nodeType).toBe(3);
            expect(elem.nodeValue).toBe('');
            expect(container.childNodes.length).toBe(1);
        });

        it('文本节点渲染', function () {
            var elem = render('foo', container);
            expect(elem.nodeType).toBe(3);
            expect(elem.nodeValue).toBe('foo');
            expect(container.childNodes.length).toBe(1);
        });

        it('文本节点可以重复渲染', function () {
            var elem = render('foo', container);
            expect(elem.nodeType).toBe(3);
            expect(elem.nodeValue).toBe('foo');
            expect(container.childNodes.length).toBe(1);
            var next = render('bar', container);
            expect(next.nodeType).toBe(3);
            expect(next.nodeValue).toBe('bar');
            expect(container.childNodes.length).toBe(1);
            expect(next).toBe(elem);
        });

        it('渲染基本节点', function () {

            var elem = render(h('div', {
                id: 1
            }, h('span', null, 'bar')), container);

            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('1');
            expect(elem.childNodes.length).toBe(1);

            var child = elem.firstChild;
            expect(child.nodeName).toBe('SPAN');
            expect(child.textContent || child.innerText).toBe('bar');
        });

        it('函数式组件', function () {

            function Foo(props) {
                return h('span', props)
            }

            var elem = render(h('div', {
                id: 1
            }, h(Foo, {
                id: 2
            }, 'bar')), container);

            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('1');
            expect(elem.childNodes.length).toBe(1);

            var child = elem.firstChild;
            expect(child.nodeName).toBe('SPAN');
            expect(child.id).toBe('2');
            expect(child.textContent || child.innerText).toBe('bar');

        });

        it('函数式组件嵌套', function () {

            function Foo(props) {
                return h('span', props)
            }

            function Bar(props) {
                return h(Foo, props)
            }

            var elem = render(h('div', {
                id: 1
            }, h(Bar, {
                id: 2
            }, 'bar')), container);

            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('1');
            expect(elem.childNodes.length).toBe(1);

            var child = elem.firstChild;
            expect(child.nodeName).toBe('SPAN');
            expect(child.id).toBe('2');
            expect(child.textContent || child.innerText).toBe('bar');

        });

        it('节点替换更新', function () {

            var elem = render(h('div'), container);
            expect(elem.nodeType).toBe(1);
            expect(elem.nodeName).toBe('DIV');
            expect(container.childNodes.length).toBe(1);
            var next = render(h('span'), container);
            expect(next.nodeType).toBe(1);
            expect(next.nodeName).toBe('SPAN');
            expect(container.childNodes.length).toBe(1);
            expect(next).not.toBe(elem);
        });

        it('属性变更', function () {

            var elem = render(h('div', {
                id: 1,
                foo: 'foo'
            }), container);

            expect(elem.nodeType).toBe(1);
            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('1');
            expect(elem.getAttribute('foo')).toBe('foo');
            expect(container.childNodes.length).toBe(1);
            var next = render(h('div', {
                id: 2,
                foo: 'bar'
            }), container);
            expect(elem.nodeType).toBe(1);
            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('2');
            expect(elem.getAttribute('foo')).toBe('bar');
            expect(container.childNodes.length).toBe(1);
            expect(next).toBe(elem);
        });

        it('属性删除', function () {

            var elem = render(h('div', {
                id: 1,
                foo: 'foo'
            }), container);
            expect(elem.nodeType).toBe(1);
            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('1');
            expect(elem.getAttribute('foo')).toBe('foo');
            expect(container.childNodes.length).toBe(1);
            var next = render(h('div', {
                foo: 'bar'
            }), container);
            expect(elem.nodeType).toBe(1);
            expect(elem.nodeName).toBe('DIV');
            expect(elem.id).toBe('');
            expect(elem.getAttribute('foo')).toBe('bar');
            expect(container.childNodes.length).toBe(1);
            expect(next).toBe(elem);
        });

        it('列表节点使用KEY', function () {
            var elem = render(h('ul', null, h('li', {
                key: 1,
                foo: 1
            }), h('li', {
                key: 2,
                foo: 2
            })), container);

            var firstElem = elem.firstChild;
            var lastElem = elem.lastChild;

            expect(firstElem.getAttribute('foo')).toBe('1');
            expect(lastElem.getAttribute('foo')).toBe('2');

            var next = render(h('ul', null, h('li', {
                key: 2,
                foo: 1
            }), h('li', {
                key: 1,
                foo: 2
            })), container);

            var firstNext = next.firstChild;
            var lastNext = next.lastChild;

            expect(firstElem).toBe(lastNext);
            expect(lastElem).toBe(firstNext);
            expect(firstNext.getAttribute('foo')).toBe('1');
            expect(lastNext.getAttribute('foo')).toBe('2');

        });

        it('列表节点使用KEY和非KEY', function () {
            var elem = render(h('ul', null, h('li', {
                key: 1,
                foo: 1
            }), h('li', {
                foo: 2
            })), container);

            var firstElem = elem.firstChild;
            var lastElem = elem.lastChild;

            expect(firstElem.getAttribute('foo')).toBe('1');
            expect(lastElem.getAttribute('foo')).toBe('2');

            var next = render(h('ul', null, h('li', {
                foo: 1
            }), h('li', {
                key: 1,
                foo: 2
            })), container);

            var firstNext = next.firstChild;
            var lastNext = next.lastChild;

            expect(firstElem).toBe(lastNext);
            expect(lastElem).toBe(firstNext);
            expect(firstNext.getAttribute('foo')).toBe('1');
            expect(lastNext.getAttribute('foo')).toBe('2');

        });

        it('删除孩子', function () {
            var elem = render(h('ul', null, h('li', {
                key: 1,
                foo: 1
            }), h('li', {
                foo: 2
            }), h('li', {
                foo: 3
            })), container);

            var firstElem = elem.firstChild;
            var secondElem = elem.firstChild.nextSibling;
            var lastElem = elem.lastChild;

            expect(firstElem.getAttribute('foo')).toBe('1');
            expect(secondElem.getAttribute('foo')).toBe('2');
            expect(lastElem.getAttribute('foo')).toBe('3');

            var next = render(h('ul', null, h('li', {
                foo: 3
            }), h('li', {
                key: 1,
                foo: 2
            })), container);

            var firstNext = next.firstChild;
            var lastNext = next.lastChild;

            expect(secondElem).toBe(firstNext);
            expect(firstElem).toBe(lastNext);
            expect(firstNext.getAttribute('foo')).toBe('3');
            expect(lastNext.getAttribute('foo')).toBe('2');
        });

        it('插入孩子', function () {
            var elem = render(h('ul', null, h('li', {
                key: 1,
                foo: 1
            })), container);

            var firstElem = elem.firstChild;

            expect(firstElem.getAttribute('foo')).toBe('1');

            var next = render(h('ul', null, h('li', {
                foo: 3
            }), h('li', {
                key: 1,
                foo: 2
            })), container);

            var firstNext = next.firstChild;
            var lastNext = next.lastChild;

            expect(firstElem).toBe(lastNext);
            expect(firstNext.getAttribute('foo')).toBe('3');
            expect(lastNext.getAttribute('foo')).toBe('2');
        });

        it('测试节点ref', function () {
            var inner = null;

            var elem = render(h('div', {
                ref: function (e) {
                    inner = e;
                }
            }), container);

            expect(elem).toBe(inner);
            render(h('span'), container);
            expect(inner).toBeNull();
        });

        it('测试子节点ref', function () {

            var inner = null;

            var elem = render(h('div', null, h('span', {
                ref: function (e) {
                    inner = e;
                }
            })), container);

            expect(inner.parentNode).toBe(elem);
            render(h('span'), container);
            expect(inner).toBeNull();
        });

        // 判断是否支持SVG
        if (document.createAttributeNS) {
            it('可以正确渲染SVG元素', function () {

                var elem = render(h('svg', {
                    viewBox: '0 0 360 360'
                }, h('path', {
                    stroke: 'white',
                    fill: 'black',
                    d: 'M 347.1 357.9'
                })), container);

                expect(elem.nodeName).toBe('svg');
                expect(elem.getAttribute('viewBox')).toBe('0 0 360 360');
                expect(elem.childNodes.length).toBe(1);

                var child = elem.firstChild;
                expect(child.nodeName).toBe('path');
                expect(child.getAttribute('stroke')).toBe('white');
                expect(child.getAttribute('fill')).toBe('black');
                expect(child.getAttribute('d')).toBe('M 347.1 357.9');
            });

            it('SVG元素可以在组件中渲染', function () {

                var Demo = function () {
                    return h('svg', {
                        viewBox: '0 0 360 360'
                    }, h('path', {
                        stroke: 'white',
                        fill: 'black',
                        d: 'M 347.1 357.9'
                    }));
                };

                var elem = render(h(Demo), container);

                expect(elem.nodeName).toBe('svg');
                expect(elem.getAttribute('viewBox')).toBe('0 0 360 360');
                expect(elem.childNodes.length).toBe(1);

                var child = elem.firstChild;
                expect(child.nodeName).toBe('path');
                expect(child.getAttribute('stroke')).toBe('white');
                expect(child.getAttribute('fill')).toBe('black');
                expect(child.getAttribute('d')).toBe('M 347.1 357.9');
            });

            it('使用正确的URI渲染SVG', function () {

                var elem = render(h('svg'), container);
                var namespace = elem.namespaceURI;
                expect(namespace).toBe('http://www.w3.org/2000/svg');
            });

            // it('可以解析类式className', function () {
            //     var elem = render(h('svg', {
            //         viewBox: '0 0 1 1',
            //         className: {
            //             foo: true,
            //             bar: false,
            //             other: 'hello'
            //         }
            //     }), container);
            //
            //     expect(elem.className).toBe('foo other');
            // });

            it('可以使用<foreignObject>返回HTML', function () {

                var elem = render(h(
                    'svg',
                    null,
                    h(
                        'g',
                        null,
                        h(
                            'foreignObject',
                            null,
                            h('a', {
                                foo: 'bar'
                            })
                        )
                    )), container);

                var a = elem.getElementsByTagName('a');

                expect(a.length).toBe(1);
                expect(a[0] instanceof HTMLAnchorElement).toBe(true);
                expect(a[0].getAttribute('foo')).toBe('bar');
            });
        }
    });

    /* eslint-enable max-nested-callbacks*/
});
