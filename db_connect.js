// モジュールの読み込み
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const mysql = require('mysql');

// mysqlの情報
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    database: 'node_demo'
});

// mysqlとの接続
connection.connect(function(err){
    if (err) throw err;
    console.log('Connected!');
})

// body-parserをミドルウェアとして設定
app.use(bodyParser.urlencoded({ extended: true }));

// テンプレートエンジンとしてejsを使用するための記述
app.set('view engine', 'ejs');

// データベースに格納するuserのデータを配列化
const userInformation = [];

// ユーザー情報の更新処理
app.post('/users/:id', (req, res) => {
    const editId = req.params.id;
    const editName = req.body.edit_name;
    const editEmail = req.body.edit_email;
    console.log(editName);
    const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    connection.query(sql, [editName, editEmail, editId], function(err, result, fields) {
        if(err) throw err;
        res.redirect('/users');
    })
});

//ユーザー登録画面の表示 GET
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/form.html');
});

// 編集画面に遷移してきたときの処理を書く
app.get('/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = "select * from users where id = ?";
    connection.query(sql, id, function(err, result, fields) {
        if(err) throw err;
        res.render('edit', {users: result});
    })
});


// ルートディレクトリにアクセスがあった際に、データベースからデータを取得して、そのデータをejsに渡して一覧表示させる
app.get('/users', (req, res) => {
    const sql = "select * from users";
    connection.query(sql, function(err, result, fields) {
        if (err) throw err;
        res.render('index', {users: result});
    });
});



// 下記のURLにアクセスしたらusersデータのjsonを返す
app.get('/api/v1/users', (req, res) => {
    const sql = "select * from users";
    connection.query(sql, function(err, result, field) {
        if (err) throw err;
        res.json(result);
    })
})

// ユーザー情報のinsert処理 POST
app.post('/', (req, res) => {
    const userData = req.body;
    // ユニークなIDでinsert
    const id = uuidv4();
    const userItem = {
        id,
        name: userData.name,
        email: userData.email
    }
    userInformation.push(userItem);
    const sql = 'INSERT INTO users SET ?';
    connection.query(sql, userItem, function(err, result, fields) {
        if(err) throw err;
        res.redirect('/users');
    })
});


// ユーザーの削除 DELETE
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM users WHERE id = ?";
    connection.query(sql, id, function(err, result, fields) {
        if(err) throw err;
    });
    console.log('deleted!');
    res.sendStatus(200);
});

connection.end();

app.listen(3000, () => console.log('Listening on port 3000'));