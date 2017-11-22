/**
 * @file gulp-remove-author 删除子文件前面的作者
 * @author zongyu(zongyu@baidu.com)
 */
var es = require('event-stream');

module.exports = function () {

    function gulpRemoveAuthor(file) {

        if (file.isNull()) {
            return this.emit('data', file);
        }
        if (file.isStream()) {
            return this.emit('error', new Error("gulp-delete-lines: Streaming not supported"));
        }

        var str = file.contents.toString('utf8');
        var newLines = [];
        var lines = str.split(/\r?\n/g);
        var started = false;

        for (var i = 0; i < lines.length; i++) {

            var line = lines[i];

            if (started) {
                newLines.push(line);
            }

            if (!started && / \*\//.test(line)) {
                started = true;
            }
        }

        str = newLines.join('\n');

        file.contents = new Buffer(str);

        this.emit('data', file);
    }

    return es.through(gulpRemoveAuthor);
};

