var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var connection = require('../model/mysqldb');
var upload = require('../fileupload');
var crypto = require('crypto');
var urlencode = require('urlencode');

var U = require('../model/user'),
    User = U.User;
U.setConnection(connection);

var F = require('../model/file'),
    File = F.File;
F.setConnection(connection);

function checkLogin(req, res, next) {
// console.log("req.session.user: " + req.session.user);
    if(!req.session.user) {
        req.flash('error', '未登录');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if(req.session.user) {
        return res.redirect('/home');
    }
    next();
}

function checkRoleManage(req, res, next) {
    console.log("checkRoleManage: " + req.session.user.role);
    var roles = ['manager', 'admin'];
    for(var i=0;i<roles.length;i++) {
        if(req.session.user.role == roles[i])
            return next();
    }
    res.redirect('/home');
}

function checkRoleAdmin(req, res, next) {
    console.log("checkRoleAdmin: " + req.session.user.role)
    if(req.session.user.role == 'admin') {
        return next();
    }
    res.redirect('/home');
}

exports.disconnect = function() {
    connection.end();
}

exports.route = function(app) {
    app.get('/', function(req, res) {
        res.redirect('/login');
    });

    app.get('/login', checkNotLogin)
    app.get('/login', function(req, res) {
        res.render('login', {
            layout: null,
            error: req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function(req, res) {
        var email = req.body.email,
            password = req.body.password;
        if(email == "" || password =="") {
            req.flash('error', "账号密码为空");
            return res.redirect('/login');
        }
// console.log("email: " + email);
// console.log("password: " + password);
        User.get(email, function(err, rows) {
            if(err) {
                req.flash('error', err);
// console.log(err);
                return res.redirect('/register');
            }
            if(rows == null) {
// console.log('此邮箱还没注册');
                req.flash('error', '邮箱未注册');
                return res.redirect('/login');
            }
            var user = rows[0];
            var md5 = crypto.createHash('md5');
            md5password = md5.update(password).digest('hex');
            if(user.password != md5password) {
                console.log("POST: 密码不正确");
                req.flash('error', "密码不正确");
                return res.redirect('/login');
            }else{
                console.log("登录成功");
                req.session.user = user;
                // req.flash('success', "登录成功");
                res.redirect('/home');
            }
        })
    });

    app.get('/register', checkNotLogin);
    app.get('/register', function(req, res) {
        res.render('register', {
            layout: null,
            error: req.flash('error').toString()
        });
    });

    app.post('/register', checkNotLogin);
    app.post('/register', function(req, res) {
        var name = req.body.name,
            email = req.body.email,
            password = req.body.password,
            password_repeat = req.body['password-repeat'];
        // console.log("name: " + name);
        // console.log("email: " + email);
        // console.log("password: " + password);
        // console.log("password_repeat: " + password_repeat);
        if(name == "" || email == "" || password == "" || password_repeat == "") {
            req.flash('error', '信息不完整');
// console.log('请将信息填写完整');
            return res.redirect('/register');
        }
        if(password_repeat != password) {
            req.flash('error', '密码不一致');
// console.log('两次输入的密码不一致');
            return res.redirect('/register');
        }
        var md5 = crypto.createHash('md5');
        password = md5.update(req.body.password).digest('hex');
        // console.log(password);
        var newUser = new User({
            name: name,
            password: password,
            email: email,
            role: 'user'
        });
        User.get(newUser.email, function(err, rows){
            if(err) {
                req.flash('error', err)
// console.log(err);
                return res.redirect('/register');
            }
            if(rows) {
// console.log("the name has been registerred");
                req.flash('error', '邮箱被注册了');
                return res.redirect('/register');
            }

            newUser.save(function(err){
                if(err) {
                    req.flash('error', err);
// console.log(err);
                    return res.redirect('/register');
                }
                req.session.user = newUser;// 用户信息存如session
                // req.flash('success', '注册成功');
                res.redirect('/home');
            });
        });
    });

    app.get('/register', checkLogin);
    app.get('/logout', function(req, res) {
        req.session.user = null;
        res.redirect('/login');
    })

    app.get('/home', checkLogin);
    app.get('/home', function(req, res) {
        res.render('home', {
            username: req.session.user.name,
            useremail: req.session.user.email,
            userrole: req.session.user.role
        });
    });

    app.get('/yuguidang*', checkLogin);
    app.get('/yuguidang*', checkRoleManage);
    app.get('/yuguidang*', function(req, res) {
        var reqpath = urlencode.decode(req.path);
        var ygd = '/yuguidang';
        var relpath = (reqpath).substring(ygd.length);
        var isdir = req.query.isdir,
            guidang = req.query.guidang,
            shanchu = req.query.shanchu,
            fileid = req.query.fileid;
        if('' == relpath) {
            relpath = '/';
            isdir = 1;
        }
        if(!_.isUndefined(isdir)) {
            isdir = parseInt(isdir);
        }
        if(isdir) {
            File.getUnStored(relpath, function(errmessage, files) {
                if(errmessage) {
                    req.flash('error', errmessage)
                    // 这里如果在回到yuguidang, 那么可能会在这里无限循环
                    return res.redirect('/guidang');
                }
                res.render('yuguidang', {
                    files: files,
                    username: req.session.user.name,
                    useremail: req.session.user.email,
                    userrole: req.session.user.role,
                    error: req.flash('error').toString()
                })
            });
        }else{
            var basename = path.basename(relpath);
            var abspath = File.rootpath + '/' + basename;
            fs.exists(abspath, function(exists) {
                if(exists) {
                    fs.readFile(abspath, function(err, data) {
                        if(err) {
                            req.flash('error', '读取文件出错.');
                            return console.log(err.message);
                        }
                        res.send(data);
                    });
                }else {
                    if(!_.isUndefined(fileid)) {
                        File.deleteFile(fileid, function(errmessage) {
                            if(errmessage) return req.flash('error', errmessage);
                            res.redirect('/yuguidang');
                        });
                    }
                }
            });
        }
        if(!_.isUndefined(guidang)) {
            File.stored(fileid);
            res.redirect('/yuguidang');
        }
        if(!_.isUndefined(shanchu)) {
            File.deleteFile(fileid);
            res.redirect('/yuguidang');
        }
    });

    app.get('/guidang*', checkLogin);
    app.get('/guidang*', function(req, res) {
        // eg. url: /guidang/dev/?isdir=1, relpath = /dev/, isdir = 1
        var reqpath = urlencode.decode(req.path);
        var gd = '/guidang';
        var relpath = reqpath.substring(gd.length);
        var isdir = req.query.isdir,
            deletefile = req.query.deletefile,
            fileid = req.query.fileid;
        if('' == relpath) {// 访问文件存储的根目录
            relpath = '/';
            isdir = 1;
        }
        if(!_.isUndefined(isdir)) {
            isdir = parseInt(isdir);
        }

        if(isdir) {
            if(!_.isUndefined(deletefile)) {
                File.deleteFolder(fileid, function(errmessage) {
                    if(errmessage) return req.flash('error', errmessage);
                    res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                });

            }else{
                File.getStored(relpath, function(err, files) {
                    if(err) req.flash('error', err);
                    res.render('guidang', {
                        currentpath: relpath,
                        files: files,
                        username: req.session.user.name,
                        useremail: req.session.user.email,
                        userrole: req.session.user.role,
                        error: req.flash('error').toString()
                    });
                })
            }
        }else{
            if(!_.isUndefined(deletefile)) {
                File.deleteFile(fileid, function(errmessage) {
                    if(errmessage) return req.flash('error', errmessage);
                    res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                });
            }else{
                /**
                 * 请求发送文件给浏览器,
                 * 如果文件存在就发送过去
                 * 不存在, 则删除数据库中此条文件的记录
                 */
                var basename = path.basename(relpath);
                var abspath = File.rootpath + '/' + basename;
                fs.exists(abspath, function(exists) {
                    if(exists) {
                        fs.readFile(abspath, function(err, data) {
                            if(err) {
                                req.flash('error', '读取文件出错.')
                                return console.log(err.message);
                            }
                            res.send(data);
                        });
                    }else {
                        req.flash("error", relpath + " does not exists!!");
                        if(!_.isUndefined(fileid)) {
                            File.deleteFile(fileid, function(errmessage) {
                                if(errmessage) return req.flash('error', errmessage);
                                res.redirect(path.normalize(reqpath + '/..') + '?isdir=1');
                            });
                        }
                    }
                })
            }
        }
    });

    function createFile(req, relpath, fnmae) {
// console.log('create file');
        var fileid = req.body.fileid,
            filename = req.body.filename,
            filecategory = req.body.filecategory,
            filedocuments = req.body.filedocuments,
            filepages = req.body.filepages,
            responsibleperson = req.body.responsibleperson,
            filetime = req.body.filetime,
            saveperiod = req.body.saveperiod,
            confidentialitype = req.body.confidentialitype;
        if( '' == fileid); // TODO
        if( '' == filename); //
        if( '' == filecategory); //
        if( '' == filedocuments); //
        if( '' == responsibleperson); //
        if( '' == filetime); //
        if( '' == saveperiod); //
        if( '' == confidentialitype); //
// console.log("req.file.originalname: " + req.file.originalname);
// console.log("input file name: " + filename);
        if(req.file.originalname != filename) {
            filename = req.file.originalname;
        }
        var filepath = relpath;
        var file = new File();
        file.createFile({
            id: fileid, name: filename, category: filecategory,
            responsibleperson: responsibleperson, filetime: filetime, path: filepath,
            pages: filepages, documentnum: filedocuments, saveperiod: saveperiod,
            confidentialitype: confidentialitype
        });
        file.save();
        // 当用户上传一个文件后, 先设置为store,这样可以在guidang中看到
        // 用户就会觉得文件上传成功, 否则用户看不到上传的文件,会很奇怪的
        setTimeout(function() {
            file.store2unstore();
        }, 1000*7);
    }

    function createFolder(req, relpath) {
// console.log('create folder');
        var foldername = req.body.foldername;
        if('' == foldername) {
            // TODO
        }
        var folderpath = relpath;
        var folder = new File();
        folder.createFolder({name: foldername, path: folderpath});
// console.log(folder);
        folder.save();
    }

    /**
     * POST /guidang/?iscreatefolder=1   // 在/目录下创建文件夹
     * POST /guidang/?isuploadfile=1     // 在/目录下上传一个文件
     */
    app.post('/guidang*', checkLogin);
    app.post('/guidang*', upload.single('inputfile'), function(req, res) {
        var reqpath = urlencode.decode(req.path);// 解决路径中出现中文的问题
        var gd = '/guidang';
        var relpath = reqpath.substring(gd.length);
        var iscreatefolder = req.query.iscreatefolder,
            isuploadfile = req.query.isuploadfile;
        if(!_.isUndefined(iscreatefolder)) {
            iscreatefolder = parseInt(iscreatefolder);
            if(iscreatefolder) {
                createFolder(req, relpath);
            }
        }

        if(!_.isUndefined(isuploadfile)) {
            isuploadfile = parseInt(isuploadfile);
            if(isuploadfile) {
                createFile(req, relpath);
            }
        }
        res.redirect(reqpath + '?isdir=1');
    });

    app.get('/yonghu', checkLogin);
    app.get('/yonghu', checkRoleAdmin);
    app.get('/yonghu', function(req, res) {
        var deleteuser = req.query.deleteuser,
            userid = req.query.userid;
        if(_.isUndefined(userid)) {
            User.getAll(function(err, users) {
                if(err) req.flash('error', err);
                res.render('users', {
                    users: users,
                    username: req.session.user.name,
                    useremail: req.session.user.email,
                    userrole: req.session.user.role
                })
            });
            return;
        }
        if(!_.isUndefined(deleteuser)) {
            User.deleteUser(userid);
            res.redirect('/yonghu');
        }
    });

    app.post('/yonghu', checkLogin);
    app.post('/yonghu', checkRoleAdmin);
    app.post('/yonghu', function(req, res) {
        var userid = req.body.userid;
        var competence = req.body.competence;
        if('' == userid);// TODO
        if('' == competence);
        // TODO 设置admin为不可修改
        User.moidfyCompetence(userid, competence);
        res.redirect('/yonghu');
    });

    app.get('/jieyue', checkLogin);
    app.get('/jieyue', checkRoleManage);
    app.get('/jieyue', function(req, res) {
        File.getBorrowed(function(err, borrow){
            if(err) req.flash('error', err);
            res.render('jieyue', {
                borrow: borrow,
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role
            })
        });
    });

    app.get('/search', function(req, res) {
        var q = req.query.q;
        File.search(q, function(err, files) {
            if(err) return;
            res.render('search',{
                files: files,
                username: req.session.user.name,
                useremail: req.session.user.email,
                userrole: req.session.user.role
            });
        });
    })
}