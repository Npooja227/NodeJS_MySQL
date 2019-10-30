// JavaScript source code
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'agile123',
    database: 'db1'
});
connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected");
    } else {
        console.log("Error while connecting with database", JSON.stringify(err, undefined, 2));
    }
});
module.exports = connection;
// JavaScript source code
