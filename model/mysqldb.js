/**
 * Created by xiaowei on 16-9-13.
 */

var mysql = require('mysql');
var settings = require('../settings');

var connection = mysql.createConnection(settings.mysqlsettings);

connection.connect(function (err) {
    if(err) return console.error("error connecting: " + err.stack);
    console.log("mysql connected as id: " + connection.threadId);
});

module.exports = connection;