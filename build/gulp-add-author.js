/**
 * @file gulp-remove-author 删除子文件前面的作者
 * @author zongyu(zongyu@baidu.com)
 */
var es = require('event-stream');

module.exports = function (opt) {

    function gulpRemoveAuthor(file) {

        if (file.isNull()) {
            return this.emit('data', file);
        }

        if (file.isStream()) {
            return this.emit('error', new Error("gulp-delete-lines: Streaming not supported"));
        }

        var str = file.contents.toString('utf8');

        str = '/**\n * @file ' + opt.name + ' ' + opt.comment + '\n * @author zongyu(zongyu@baidu.com)\n */\n\n' + str;

        file.contents = new Buffer(str);

        this.emit('data', file);
    }

    return es.through(gulpRemoveAuthor);
};

