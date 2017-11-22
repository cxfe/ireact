# [eform-lang](http://gitlab.baidu.com/eform/eform-lang) — eform语言增强模块

## Environments
eform-lang支持IE6+，Firefox 14+，Chrome 22+，Opera 14+ 以及大部分手机浏览器，支持RequireJS，
建议使用[esl](https://github.com/ecomfe/esl)加载。

## Usage
通过 edp 引入模块：

``` bash
    edp import eform-lang
```
简单使用示例：
```javascript
    require(['eform-lang'], function(lang) {
        var arr = [1, 2, 3];
        lang.merge(arr, [4, 5]);
        lang.each(arr, function() {
            alert(this); // 会依次弹出1，2，3，4，5
        });
    });
```

## Api

### .bind(fn: Function, context: * , \[args\]): Function
固定函数的this变量和若干参数，其中context为绑定的this对象，args为可变参数列表。

### .clone(obj: Object, \[deep: boolean\]): Object
克隆一个对象，如果deep为true进行深度克隆**不进行循环引用检测**

### .each(obj: Object|Array, callback: Function): Object|Array
遍历数组或者对象并执行回调函数，如果函数返回false，则终止遍历。

### .extend(target: Object, \[args...\]): Object
将一个或者多个对象的属性合并到第一个。

### .format(source: string, \[opts\]): string
格式化字符串，进行变量替换。

### .guid(\[prefix: string\]): string
获取一个全局唯一标识。

### .indexOf(arr: Array, elem * , \[i: number\]): number
返回元素在数组中的位置，没找到返回-1。

### .inherits(subClass: Function, superClass: Function): Function
使subClass继承superClass。

### .merge(target: Array, \[args...\]): Array
将一个或者多个数组（类数组）合并到第一个。

### .noop()
空函数。

### .param(params: Object): string
序列化URL参数，支持value为数组。

### .trim(str: string): string
去除字符串两边的空格。

### .type(obj: * ): string
判断变量类型。

