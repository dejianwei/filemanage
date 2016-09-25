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

// connection.query('select * from files f, users u, borrow b where b.user_id = u.id and b.file_id = f.id;', function(err, rows, fields) {
//     console.log(rows);
// });
//
// connection.end();