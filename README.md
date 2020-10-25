# 詳細  

Node.jsでローカル開発環境(MAMP)のMYSQLに接続し、  
簡単なユーザー登録機能を実装する。  

CRUDを満たす4つのメソッド(Create / Read / Update / Delete)で処理を記述  
PUTメソッドでのデータ更新は実装中。  

# 各ファイルの役割  

■ db_connect.js   : node.jsのサーバー側の記述(モジュールの読み込み、MySQLとの接続、HTTPメソッドを記述)  
■ views/index.ejs : ユーザー一覧の表示  
■ views/edit.ejs  : ユーザー情報の編集画面  
■ form/form.html  : ユーザー登録画面  

# 使用モジュール
  
■ body-parser : HTML(ejs)のformのinputに入力された値を受け取れるようにするモジュール  
■ ejs         : JavaScriptテンプレートエンジン  
■ uuid        : ランダムなID値を生成する  
■ mysql       : mysql用のNode.jsドライバー  


