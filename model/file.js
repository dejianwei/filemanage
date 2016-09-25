/**
 * Created by xiaowei on 16-9-20.
 */

var moment = require('moment');
var momenttz = require('moment-timezone');

var connection;

/**
 * @param file
 *
 * file 属性, 14个:
 * id, name, category, page(1), documentnum(1), borrowed(false), responsibleperson
 * savetime, filetime, saveperiod(forever shor ttime, long time)(forever),
 * confidentialitype(open, inner, secret, top secret)(inner), path, isdirectory(false), isstored(false),
 *
 */
function File() {
}

File.prototype.createFolder = function(folder){
    // 可直接获得的属性的值
    this.path = folder.path;
    this.name = folder.name + '/';

    // 根据数据库设计规则来设定这些属性的值
    this.id = folder.path + folder.name + '/';
    this.category = 'folder';
    this.page = this.documentnum = 1;
    this.borrowed = 0;
    this.responsibleperson = 'admin';
    this.savetime = this.filetime = moment().format('YYYY-MM-DD');
    this.saveperiod = 'forever';
    this.confidentialitype = 'inner';
    this.isdirectory = 1;
    this.isstored = 1;
}

File.prototype.createFile = function(file) {
    // 必备属性
    this.id = file.id;
    this.name = file.name;
    this.category = file.category;
    this.responsibleperson = file.responsibleperson;
    this.filetime = file.filetime;
    this.path = file.path;
    // 可选的默认属性
    if(file.page) this.page = file.page; else this.page = 1;
    if(file.documentnum) this.documentnum = file.documentnum; else this.documentnum = 1;
    if(file.borrowed) this.borrowed = file.borrowed; else this.borrowed = 0;
    if(file.saveperiod) this.saveperiod = file.saveperiod; else this.saveperiod = "forever";
    if(file.confidentialitype) this.confidentialitype = file.confidentialitype; else this.confidentialitype = "inner";
    if(file.isdirectory) this.isdirectory = file.isdirectory; else this.isdirectory = 0;
    if(file.isstored) this.isstored = file.isstored; else this.isstored = 1;
    if(file.savetime) this.savetime = file.savetime; else this.savetime = moment().format('YYYY-MM-DD');
}

exports.File = File;
exports.setConnection = function(conn) {
    connection = conn;
}

File.rootpath = '/home/xiaowei/code/web/filemanage/files';

function convertCST2UTC(rows) {
    var jun, i;
    for(i=0;i<rows.length;i++) {
        jun = momenttz(rows[i].filetime);
        rows[i].filetime = jun.tz('Asia/Shanghai').format('YYYY-MM-DD');
        jun = momenttz(rows[i].savetime);
        rows[i].savetime = jun.tz('Asia/Shanghai').format('YYYY-MM-DD');
    }
}

/**
 * 设计这个方法的原本目的是想让'预归档'和'归档'有相同的表现形式
 * 即目录的形式(列表中有文件夹,点击文件夹后进入一耳光新的目录)
 * 当时因为使用这种形式会导致对目录的判定变得复杂
 * 不能简单的根据isstored的0,1来判断归档和未归档文件
 *
 * 最终采用方案是,归档以目录形式展现,预归档以列表形式展现
 */
// var get = function(path, stored, callback) {
//     connection.query('select * from files where path = "' + path + '" and isstored = "' + stored + '"', function (err, rows, fields) {
//         if (err) return callback(err);
//         convertCST2UTC(rows);
//         callback(null, rows);
//     });
// }

File.getStored = function(path, callback) {
    // get(path, 1, callback);
    connection.query('select * from files where path = "' + path + '" and isstored = "' + 1 + '"', function (err, rows, fields) {
        if (err) return callback(err);
        convertCST2UTC(rows);
        callback(null, rows);
    });
}

File.getUnStored = function(path, callback) {
    // get(path, 0, callback);
    connection.query('select * from files where isstored = "' + 0 + '"', function (err, rows, fields) {
        if (err) return callback(err);
        convertCST2UTC(rows);
        callback(null, rows);
    });
}

/**
 * 在执行联表查询的时候，不同表中相同命名的属性会被覆盖
 * 因此这里用as重新定了属性的值
 * @param callback
 */
File.getBorrowed = function(callback) {
    connection.query('select u.name as username, u.email, f.id, f.name as filename, f.filetime, f.responsibleperson, f.confidentialitype from files f, users u, borrow b where b.user_id = u.id and b.file_id = f.id', function (err, rows, fields) {
        if (err) return callback(err);
        console.log(rows);
        convertCST2UTC(rows);
        callback(null, rows);
    });
}

File.stored = function(fileid) {
    connection.query('UPDATE files SET isstored=1 WHERE id=' + fileid, function (err, rows, fields) {
        if (err) {
            console.log('faild to stored file ' + fileid);
            return err;
        }
        console.log('success to stroed file ' + fileid);
    });
}

File.deleteFolder = function(fileid) {

    connection.query('DELETE FROM files WHERE id="' + fileid + '"', function(err, rows, fields){
        if(err) {
            console.log('failed to delete folder that id = ' + fileid );
            return console.log(err.message);
        }
        console.log('success to delete folder that id = ' + fileid);

    });

    // 文件夹的id就是文件夹下文件的路径
    connection.query('DELETE FROM files WHERE path="' + fileid + '"', function(err, rows, fields){
        if(err) {
            console.log('failed to delete file of folder that path = ' + fileid );
            return console.log(err.message);
        }
        console.log('success to delete file of folder that path = ' + fileid);

    });
}

File.deleteFile = function(fileid) {
    connection.query('DELETE FROM files WHERE id="' + fileid + '"', function(err, rows, fields){
        if(err) {
            console.log('failed to delete file that id = ' + fileid );
            return err;
        }
        console.log('success to delete file that id = ' + fileid);

    });
}
// INSERT INTO `filemanage`.`files`
// (`name`, `category`, `page`, `documentnum`, `borrowed`, `responsibleperson`, `savetime`, `filetime`, `saveperiod`, `confidentialitype`, `path`, `isdirectory`, `isstored`)
// VALUES
// ('file7.txt', 'test', '1', '1', '0', 'wei', '2016-09-24', '2016-09-24', 'forever', 'inner', '/', '0', '1');
File.prototype.save = function(){
// console.log("save file to database");
    var sql = 'INSERT INTO files ' +
        '(id, name, category, page, documentnum, borrowed, responsibleperson, ' +
        'savetime, filetime, saveperiod, confidentialitype, path, isdirectory, isstored)' +
        'VALUES' +
        '("' + this.id + '", "' + this.name + '","' + this.category + '", "' + this.page + '", "' + this.documentnum + '", "' + this.borrowed + '", "' + this.responsibleperson + '", "' +
        this.savetime + '", "' + this.filetime + '", "'+ this.saveperiod + '", "' + this.confidentialitype + '", "' + this.path + '", "' + this.isdirectory + '", "' + this.isstored +'")';
// console.log(sql);
    connection.query(sql, function(err, rows, fields){
        if(err) return console.log(err.message);
    });
}

