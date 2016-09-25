var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var hbs = require('hbs');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');

var routes = require('./routes/index');
// var connection = require('./model/mysqldb');

// var sessionStore = new MySQLStore({}, connection);

var options = {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'filemanage'
};

var sessionStore = new MySQLStore(options);

var app = express();

// view engine setup
hbs.registerHelper("equals",function(v1,v2,options){
    if(v1 == v2){
        return options.fn(this);
    }else{
        return options.inverse(this);
    }
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    cookie: { cookie: { maxAge: 60000 }}
}));

app.use(flash()); // 开启session功能后,使用flash
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

routes.route(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    // res.render('404');
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(req, res, next) {
    console.log("get req.session");
    var err = req.flash('error');
    next(err);
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            layout: null,
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        layout: null,
        message: err.message,
        error: {}
    });
});

process.on('SIGINT', function () {
    console.log('Got a SIGINT. Goodbye wei');
    routes.disconnect();
    process.exit(0);
});

module.exports = app;
