/**
 * @file render-to-string.spec
 * @author zongyu(zongyu@baidu.com)
 */


define(function (require) {
    var h = require('ireact').h;
    var Component = require('ireact').Component;
    var renderToString = require('ireact').renderToString;

    var Noop = function () {

    };

    function inherits(subClass, superClass) {

        Noop.prototype = superClass.prototype;
        subClass.prototype = new Noop();
        Noop.prototype = {};
        subClass.prototype.constructor = subClass;
        return subClass;
    }

    describe('render-to-string', function () {

        describe('Basic JSX', function () {

            it('可以渲染基本的JSX', function () {
                expect(renderToString(null)).toBe('');
                expect(renderToString(undefined)).toBe('');
                expect(renderToString(false)).toBe('');
            });

            it('忽略空属性值', function () {

                expect(renderToString(h('div', {
                    a: null,
                    b: undefined,
                    c: false
                }))).toBe('<div></div>');

                expect(renderToString(h('div', {
                    foo: 0
                }))).toBe('<div foo="0"></div>');
            });

            it('空值属性应当无属性值', function () {

                expect(renderToString(h('div', {
                    'class': '',
                    style: '',
                    foo: true,
                    bar: true
                }))).toBe('<div class style foo bar></div>');
            });

            it('应当忽略函数属性', function () {

                expect(renderToString(h('div', {
                    a: function () {
                    },
                    b: function () {
                    }
                }))).toBe('<div></div>');
            });

            it('应当对实体内容编码', function () {

                expect(renderToString(h('div', {
                    a: '"<>&'
                }, '"<>&'))).toBe('<div a="&quot;&lt;&gt;&amp;">&quot;&lt;&gt;&amp;</div>');
            });

            it('空值孩子应当被忽略', function () {
                expect(renderToString(h('div', {}, null, '|', undefined, '|', false))).toBe('<div>||</div>');
            });

            it('自闭合标签不应当出现回括号', function () {
                expect(renderToString(h('input', {}, h('p', {}, 'Hello World'))))
                    .toBe('<input><p>Hello World</p>');
            });

            it('应当可以解析对象形式的样式', function () {

                expect(renderToString(h('div', {
                    style: {color: 'red', border: 'none'}
                }))).toBe('<div style="color: red; border: none;"></div>');
            });

            it('应当可以正确渲染svg元素', function () {

                expect(renderToString(h(
                    'svg',
                    null,
                    h('image', {xlinkHref: '#'}),
                    h(
                        'foreignObject',
                        null,
                        h('div', {xlinkHref: '#'})
                    ),
                    h(
                        'g',
                        null,
                        h('image', {xlinkHref: '#'})
                    )
                ))).toBe('<svg><image xlink:href="#"></image><foreignObject>'
                    + '<div xlinkHref="#"></div></foreignObject><g><image xlink:href="#"></image></g></svg>');
            });
        });

        describe('函数式组件', function () {

            it('函数式组件应当可以正常渲染', function () {

                var called = 0;

                var Test = function (_ref) {

                    var foo = _ref.foo;
                    var children = _ref.children;
                    called++;

                    expect(foo).toBe('test');
                    expect(children).toEqual(['content']);

                    return h(
                        'div',
                        {foo: foo},
                        children
                    );
                };

                expect(renderToString(h(Test, {
                    foo: 'test'
                }, 'content'))).toBe('<div foo="test">content</div>');

                expect(called).toBe(1);

            });

            it('函数式组件在JSX中生效', function () {

                var called = 0;

                var Test = function (_ref) {

                    var foo = _ref.foo;
                    var children = _ref.children;
                    called++;

                    return h(
                        'div',
                        {foo: foo},
                        children
                    );
                };

                expect(renderToString(h(
                    'section',
                    null,
                    h(
                        Test,
                        {foo: 1},
                        h(
                            'span',
                            null,
                            'asdf'
                        )
                    )
                ))).toBe('<section><div foo="1"><span>asdf</span></div></section>');

                expect(called).toBe(1);
            });

            it('默认参数应当有效果', function () {

                var Test = function Test(props) {
                    return h('div', props);
                };

                Test.defaultProps = {
                    foo: 'default foo',
                    bar: 'default bar'
                };

                expect(renderToString(h(Test))).toBe('<div foo="default foo" bar="default bar"></div>');
                expect(renderToString(h(Test, {
                    bar: 'b'
                }))).toBe('<div foo="default foo" bar="b"></div>');

                expect(renderToString(h(Test, {
                    foo: 'a',
                    bar: 'b'
                }))).toBe('<div foo="a" bar="b"></div>');
            });
        });

        describe('类式组件', function () {

            it('组件可以正常渲染', function () {

                var Test = function () {
                    Component.call(this);
                };

                inherits(Test, Component);

                Test.prototype.render = function () {

                    var foo = this.props.foo;
                    var children = this.props.children;

                    return h('div', {
                        foo: foo
                    }, children);
                };

                var rendered = renderToString(h(Test, {
                    foo: 'test'
                }, 'content'));

                expect(rendered).toBe('<div foo="test">content</div>');
            });

            it('组件可以在JSX中正常渲染', function () {

                var Test = function () {
                    Component.call(this);
                };

                inherits(Test, Component);

                Test.prototype.render = function () {

                    var foo = this.props.foo;
                    var children = this.props.children;

                    return h('div', {
                        foo: foo
                    }, children);
                };

                var rendered = renderToString(h('section', null, h(Test, {
                    foo: 1
                }, h('span', null, 'asdf'))));

                expect(rendered).toBe('<section><div foo="1"><span>asdf</span></div></section>');
            });

            it('defaultProps使用正常', function () {

                var Test = function () {
                    Component.call(this);
                };

                inherits(Test, Component);

                Test.prototype.render = function (props) {
                    return h('div', props);
                };

                Test.defaultProps = {
                    foo: 'default foo',
                    bar: 'default bar'
                };

                expect(renderToString(h(Test))).toBe('<div foo="default foo" bar="default bar"></div>');
                expect(renderToString(h(Test, {
                    bar: 'b'
                }))).toBe('<div foo="default foo" bar="b"></div>');

                expect(renderToString(h(Test, {
                    foo: 'a',
                    bar: 'b'
                }))).toBe('<div foo="a" bar="b"></div>');
            });

            it('componentWillMount调用正常', function () {

                var Test = function () {
                    Component.call(this);
                };

                inherits(Test, Component);

                Test.prototype.render = function (props) {
                    return h('div', props);
                };

                var called = 0;

                Test.prototype.componentWillMount = function () {
                    called++;
                };

                renderToString(h(Test));

                expect(called).toBe(1);
            });

            it('contexts可以正确传递', function () {

                var CONTEXT = {a: 'a'};
                var PROPS = {b: 'b'};

                var Outer = function () {
                    Component.call(this);
                };

                inherits(Outer, Component);
                var called = 0;

                Outer.prototype.getChildContext = function () {
                    called++;
                    return CONTEXT;
                };

                Outer.prototype.render = function (props) {
                    return h('div', null, h(Inner, props));
                };

                var Inner = function () {
                    Component.call(this);
                };

                inherits(Inner, Component);

                Inner.prototype.render = function (props, state, context) {
                    return h('div', null, context && context.a);
                };

                expect(renderToString(h(Outer))).toBe('<div><div>a</div></div>');

                expect(called).toBe(1);

                CONTEXT.foo = 'bar';
                expect(renderToString(h(Outer, PROPS))).toBe('<div><div>a</div></div>');
                expect(called).toBe(2);
            });
        });

        describe('测试dangerouslySetInnerHTML', function () {
            it('应当支持dangerouslySetInnerHTML', function () {
                var html = '<a href="foo">asdf</a> some text <ul><li>foo<li>bar</ul>';
                var rendered = renderToString(h('div', {
                    id: 'f',
                    dangerouslySetInnerHTML: {
                        __html: html
                    }
                }));

                expect(rendered).toBe('<div id="f">' + html + '</div>');
            });

            it('should override children', function () {

                var rendered = renderToString(h('div', {
                    dangerouslySetInnerHTML: {
                        __html: 'foo'
                    }
                }, h('b', null, 'bar')));

                expect(rendered).toBe('<div>foo</div>');
            });
        });

        describe('className / class 匹配和 for / htmlFor 匹配', function () {

            it('className -> class', function () {

                expect(renderToString(h('div', {
                    className: 'foo bar'
                }))).toBe('<div class="foo bar"></div>');
            });

            it('class -> class', function () {
                expect(renderToString(h('div', {
                    'class': 'foo bar'
                }))).toBe('<div class="foo bar"></div>');
            });

            it('class优先于className', function () {
                expect(renderToString(h('div', {
                    'class': 'foo',
                    className: 'foo bar'
                }))).toBe('<div class="foo"></div>');
            });

            it('htmlFor -> for', function () {

                expect(renderToString(h('div', {
                    htmlFor: 'foo bar'
                }))).toBe('<div for="foo bar"></div>');
            });

            it('for -> for', function () {
                expect(renderToString(h('div', {
                    'for': 'foo bar'
                }))).toBe('<div for="foo bar"></div>');
            });

            it('for优先于htmlFor', function () {
                expect(renderToString(h('div', {
                    'for': 'foo',
                    htmlFor: 'foo bar'
                }))).toBe('<div for="foo"></div>');
            });

            it('将对象类型的类合并成字符串', function () {

                expect(renderToString(h('div', {
                    'class': {foo: 1, bar: 0, baz: true, buzz: false}
                }))).toBe('<div class="foo baz"></div>');

                expect(renderToString(h('div', {
                    className: {foo: 1, bar: 0, baz: true, buzz: false}
                }))).toBe('<div class="foo baz"></div>');
            });

            it('将对象类型的样式合并成字符串', function () {

                expect(renderToString(h('div', {
                    'style': {foo: 1, bar: 0}
                }))).toBe('<div style="foo: 1px; bar: 0px;"></div>');
            });

            it('将大写的样式转换成连字符', function () {

                expect(renderToString(h('div', {
                    'style': {fooDemo: 1, barDemo: 0}
                }))).toBe('<div style="foo-demo: 1px; bar-demo: 0px;"></div>');
            });

            it('部分属性不应当添加PX', function () {

                expect(renderToString(h('div', {
                    'style': {fillOpacity: 1, opacity: 0}
                }))).toBe('<div style="fill-opacity: 1; opacity: 0;"></div>');
            });

            it('ms开头的属性应当有连字符', function () {

                expect(renderToString(h('div', {
                    'style': {msDemo: 1}
                }))).toBe('<div style="-ms-demo: 1px;"></div>');
            });
        });
    });
});
