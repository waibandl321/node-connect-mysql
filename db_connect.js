const mysql = require('./node_modules/mysql');

// データベースに接続
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    database: 'node_demo'
}); 

con.connect(function(err) {
    if(err) throw err;
    console.log('Connected!');
    // データベースを作成
    con.query("CREATE DATABASE node_demo", function(err, result) {
        if(err) throw err;
        console.log('Database created!');
    })
})

// デーブルの作成
con.connect(function(err) {
    if(err) throw err;
    console.log('connected');
    // テーブルの作成
    const sql = 'CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))';
    // テーブルにカラムを追加する場合
    // const sql = 'ALTER TABLE users ADD COLUMN email VARCHAR(255)';
    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log('Table created');
    })
})

// データの挿入
con.connect(function(err) {
    if(err) throw err;
    console.log('Connected');
    const sql = 'INSERT INTO users (name, email) values ("Ayaka", "shirata@gmail.com")';
    con.query(sql, function(err, result) {
        if(err) throw err;
        console.log('1 record inserted ID : ' + result.insertId);
    })
})

// データの取得
con.connect(function(err) {
    if(err) throw err;
    con.query("SELECT * FROM users", function(err, result, fields) {
        if(err) throw err;
        console.log(result);
    })
})