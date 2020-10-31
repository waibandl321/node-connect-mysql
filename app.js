// 使用モジュール
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const LocalStrategy = require('passport-local').Strategy;

/* =============================================
ミドルウェア
============================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.set('view engine', 'ejs');
// ログイン処理用のミドルウェア
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    const sql = "select * from users where email = ?";
    connection.query(sql, email, function(err, user, fields) {
        if(bcrypt.compareSync(password, user[0].password)) {
        // doneに認証済みユーザー情報を与える
        return done(null, user);
    }
    return done(null, false, {message: "invalid"});
    });
}))

/* =============================================
mysqlとの接続
============================================= */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    database: 'node_demo2'
});
connection.connect((err) => {
    if(err) throw err;
    console.log('Connected!');
});


/* =============================================
ルーティング
============================================= */
app.get('/register', (req, res) => {
    res.render('signin');
});

app.post('/register', [
    // formのバリデーションチェック checkの中にはsformのname属性
    check('name').not().isEmpty(),
    check('email').not().isEmpty().isEmail(),
    check('password').not().isEmpty().isAlphanumeric(),
], (req, res) => {
    let errors = [];
    errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.send('入力に誤りがあります');
    } else {
        // パスワードのハッシュ化
        const password = req.body.password;
        const hashPassword = bcrypt.hashSync(password, 10);
        const userItem = {
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
        }
        const sql = "INSERT INTO users SET ?";
        connection.query(sql, userItem, (err, result, fields) => {
            if(err) throw err;
            res.redirect('/login');
        });
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', [
    check('email').not().isEmpty().isEmail(),
    check('password').not().isEmpty().isAlphanumeric(),
],
passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/success',
    session: false,
}),
(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.send("異常な入力値が検出されました");
    } else {
        res.redirect('/success');
    }
})

app.get('/success', (req, res) => res.render('success'));

app.listen(3000, () => console.log('Listening on port 3000'));





