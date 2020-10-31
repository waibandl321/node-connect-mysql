/* =============================================
モジュールの読み込み
============================================= */
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const mysql = require('mysql');
// パスワードのhash化
const bcrypt = require('bcrypt');
// バリデーションのためのライブラリ
const { check, validationResult } = require('express-validator');
// ログイン認証で使用するpassport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
var flash = require('connect-flash');
const { json } = require('body-parser');
const route = require('./route/route')

/* =============================================
ミドルウェアの設定
============================================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
// ログイン状態を管理するsessionを使用
app.set('trust proxy', 1)
app.use(session({
    secret:'session',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 30
    }
}));

// body-parserをミドルウェアとして設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
// テンプレートエンジンとしてejsを使用するための記述
app.set('view engine', 'ejs');


/* =============================================
mysqlの情報
============================================= */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 8889,
    database: 'node_demo'
});

/* =============================================
mysqlとの接続
============================================= */
connection.connect(function(err){
    if (err) throw err;
    console.log('Connected!');
})

// データベースに格納するuserのデータを配列化
const userInformation = [];

//ユーザー登録画面の表示 GET
app.get('/', route.login);
app.get('/login', route.login);
// 登録画面表示
app.get('/signin', route.index);

/* =============================================
サインインの処理
============================================= */
app.post('/signin', [
    check('name').not().isEmpty(),
    // メール形式かチェック
    check('email').not().isEmpty().isEmail(),
    // アルファベットと数字かチェック
    check('password').not().isEmpty().isAlphanumeric(),
], (req, res) => {
    const errors = validationResult(req);
    // バリデーションエラーの場合
    if(!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    } else {
        const userData = req.body;
        // パスワードのハッシュ化
        const password = userData.password;
        bcrypt.genSalt(saltRounds, (err, salt) => {
            bcrypt.hash(password, salt, function(err, hash) {
                // ユニークなIDでinsert
                const id = uuidv4();
                const userItem = {
                    id,
                    name: userData.name,
                    email: userData.email,
                    password: hash
                }
                userInformation.push(userItem);
                const sql = 'INSERT INTO users SET ?';
                connection.query(sql, userItem, function(err, result, fields) {
                    if(err) throw err;
                    res.redirect('/login');
                })
            });
        });
    }
});

/* =============================================
ログイン処理
============================================= */
// passportの設定 ログイン処理のミドルウェア
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => {
    const sql = "select * from users where email = ?";
    connection.query(sql, email, function(err, user, fields) {
        if(bcrypt.compareSync(password, user[0].password)) {
            // doneに認証済みユーザー情報を与える
            return done(null, user);
        }
        return done(null, false, {message: "invalid"});
        });
    }
));

//  sessionに格納する
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// ログイン判定処理
app.post('/login',[
    // メール形式かチェック
    check('email').not().isEmpty().isEmail(),
    // アルファベットと数字かチェック
    check('password').not().isEmpty().isAlphanumeric(),
    ],
    passport.authenticate('local', {
        failureRedirect: '/login',
        session: true,
    }),
    (req, res) => {
        console.log(req.session);
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const sql = "select * from users where email = ?";
            connection.query(sql, req.body.email, function(err, user, fields) {
                req.user = user;
                res.redirect('/mypage');
            });
        }
});

// ログイン処理がOKの場合は/mypageに遷移
app.get('/mypage', (req, res) => {
    if(!req.user) {
        res.redirect('/login');
    } else {
        const sql = "SELECT * FROM posts WHERE user_id = ?"
        connection.query(sql, req.user[0].id, function(err, posts, fields) {
            res.render('user', {
                user: req.user[0],
                posts: posts
            });
        });
    }
})


/* =============================================
投稿機能
============================================= */
const postInformation = [];
app.get('/posts', (req, res) => {
    if(!req.user) {
        res.redirect('/login');
    } else {
        // 投稿データの取得
        const sql = "SELECT * FROM posts";
        connection.query(sql, (err, result, fields) => {
            if (err) throw err;
            res.render('posts', {
                user: req.user[0],
                posts: result
            });
        });
    }
});

app.post('/posts', [
    check('post').not().isEmpty()
],
(req, res) => {
    const userId = req.body.user_id;
    const content = req.body.post;
    const userItem = {
        user_id: userId,
        content: content
    }
    const sql = 'INSERT INTO posts SET ?';
    connection.query(sql, userItem, (err, result, fields) => {
        if(err) throw err;
        res.redirect('/posts');
    })
});


/* =============================================
投稿の更新、削除
============================================= */
// 更新
app.post('/post/:id/update', (req, res) => {
    const editContent = req.body.edit_content;
    const postId = req.body.post_id;
    const editItems = [editContent, postId];
    const spl = "UPDATE posts SET content = ? WHERE id = ?";
    connection.query(spl, editItems, (err, result, fields) => {
        if(err) throw err;
        res.redirect('/posts');
    });
});

// 削除
app.post('/post/:id/delete', (req, res) => {
    const postId = req.params.id;
    const sql = 'DELETE FROM posts WHERE id = ?';
    connection.query(sql, postId, (err, result, fields) => {
        if(err) throw err;
        res.redirect('/posts');
    });
});

/* =============================================
ログアウト
============================================= */
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});


app.listen(3000, () => console.log('Listening on port 3000'));