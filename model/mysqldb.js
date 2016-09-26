/**
 * Created by xiaowei on 16-9-13.
 */

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '127.0.01',
    user: 'root',
    password: 'root',
    database: 'filemanage'
});

connection.connect(function (err) {
    if(err) return console.error("error connecting: " + err.stack);
    console.log("mysql connected as id: " + connection.threadId);
});

module.exports = connection;

// connection.query('select * from files where name like "%' + 'ui' + '%"', function(err, rows, fields) {
//     if(err) {
//         return console.log("search failed: " + err.message);
//     }
//     console.log(rows);
// });
//
// connection.end();