/**
 * @file export 暴露所有可用的接口
 * @author zongyu(zongyu@baidu.com)
 */

// 暴露所有可用的接口
React.util = {
    type: type,
    each: each,
    extend: extend,
    defer: defer
};

React.VNode = VNode;
React.h = React.createElement = h;
React.cloneElement = cloneElement;
React.Component = Component;
React.render = render;
