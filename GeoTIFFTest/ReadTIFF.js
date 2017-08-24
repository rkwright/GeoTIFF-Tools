var fs = require('fs');

fs.open("epub_logo.tiff", 'r', function(status, fd) {
    if (status) {
        console.log(status.message);
        return;
    }
    var buffer = new Buffer(100);
    fs.read(fd, buffer, 0, 100, 0, function(err, num) {
        console.log(buffer.toString('utf8', 0, num));
    });
});