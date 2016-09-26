var fs = require('fs');

var rootpath = '/home/xiaowei/code/web/filemanage/files';

var filepath = rootpath + '/数据库ER图.vsdx';

fs.unlink(filepath, function(err){
    if(err) console.log(err);
    console.log('sucess to remove file.');
});
