/**
 * Created by xiaowei on 16-9-20.
 */

var moment = require('moment');
var momenttz = require('moment-timezone');
var fs = require('fs');
var settings = require('../settings');

// 连接数据库的对象
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

File.rootpath = settings.filesrootpath;

// 数据库中的时间表示形式转换成 YYYY-MM-DD的形式
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
        if (err) {
            console.log('get stored error: ' + err.message);
            return callback(err);
        }
        console.log('get stored success');
        convertCST2UTC(rows);
        callback(null, rows);
    });
}

File.getUnStored = function(path, callback) {
    connection.query('select * from files where isstored = "' + 0 + '"', function (err, rows, fields) {
        if (err) {
            callback('failed to get unstored file.');
            return console.log(err.message);

        }
        convertCST2UTC(rows);
        callback(null, rows);
    });
}

/**
 * TODO Borrow是一张表, getBorrowed应该包含在borrow对象的方法里面
 *
 * 在执行联表查询的时候，不同表中相同命名的属性会被覆盖
 * 因此这里用as重新定了属性的值
 * @param callback
 */
File.getBorrowed = function(callback) {
    connection.query('select u.name as username, u.email, f.id, f.name as filename, f.filetime, f.responsibleperson, f.confidentialitype from files f, users u, borrow b where b.user_id = u.id and b.file_id = f.id', function (err, rows, fields) {
        if (err) {
            console.log('get borrowed error: ' + err.message);
            return callback(err);
        }
        console.log('get borrowed success ');
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

/**
 * 递归的删除数据库中选中的的文件夹
 * @param fileid
 * @param callback
 */
File.deleteFolder = function(fileid, callback) {
    connection.query('DELETE FROM files WHERE id="' + fileid + '"', function(err, rows, fields){
        if(err) {
            callback('delete folder failed.');
            return console.log(err.message);
        }
        connection.query('select id, category from files where path="' + fileid + '"', function(err, rows, fields){
            if(err) {
                callback('delete folder failed.');
                return console.log(err.message);
            }
            for(var i=0;i<rows.length;i++) {
                if(rows[i].category == 'folder') File.deleteFolder(rows[i].id);
                else File.deleteFile(rows[i].id);
            }
        });
    });
}

File.deleteFile = function(fileid, callback) {
    connection.query('select path, name from files where id ="' + fileid + '"', function(err, rows, fields) {
        if(err) {
            callback('delete file failed.');
            return console.log(err.message);
        }
        // console.log(rows);
        var filepath = File.rootpath + '/' + rows[0].name;
        fs.unlink(filepath, function(err){
            if(err) {
                return console.log(err.message);
            }
        });
        connection.query('DELETE FROM files WHERE id="' + fileid + '"', function(err, rows, fields){
            if(err) {
                return console.log(err.message);
            }
        });
    });
    callback(null);
}

File.search = function(q, callback) {
    connection.query('select * from files where name like "%' + q + '%"', function(err, rows, fields) {
        if(err) {
            callback(err);
            return console.log("search failed: " + err.message);
        }
        convertCST2UTC(rows);
        callback(null, rows);
        console.log('search success');
    });
}

File.prototype.save = function(){
// console.log("save file to database");
    var sql = 'INSERT INTO files ' +
        '(id, name, category, page, documentnum, borrowed, responsibleperson, ' +
        'savetime, filetime, saveperiod, confidentialitype, path, isdirectory, isstored)' +
        'VALUES' +
        '("' + this.id + '", "' + this.name + '","' + this.category + '", "' + this.page + '", "' + this.documentnum + '", "' + this.borrowed + '", "' + this.responsibleperson + '", "' +
        this.savetime + '", "' + this.filetime + '", "'+ this.saveperiod + '", "' + this.confidentialitype + '", "' + this.path + '", "' + this.isdirectory + '", "' + this.isstored +'")';

    connection.query(sql, function(err, rows, fields){
        if(err) {
            console.log('save file error' + err.message);
            return console.log(err.message);
        }
        console.log('save file success');
    });
}

File.prototype.store2unstore = function() {
    var that = this;
    connection.query('UPDATE files SET isstored=0 WHERE id="' + this.id +'"', function(err, rows, fields) {
        if(err) {
            console.log('set new file unstore faild ' + err.message);
            return;
        }
        console.log('set new file unstore success that id = ' + that.id);
    });
}

