// メインプログラム用JavaScriptファイル
// node.jsを使ってwebアプリケーションを構築するサンプル
// httpモジュールを読み込んでインスタンス化する。
const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
// urlモジュールを読み込んでインスタンス化する。
const url = require('url');
const qs = require('querystring');

// ejsファイルの読み込み
const sign_page = fs.readFileSync('./sign.ejs', 'utf8');
const login_page = fs.readFileSync('./login.ejs', 'utf8')

const max_num = 10;
const filename = 'mydata.txt';
var message_data;
readFromFile(filename);
// サーバーオブジェクトを構築する。
var server = http.createServer (getFromClient);
// ポート3000で展開する。(待ち受け状態にする。)
server.listen(3000);
// コンソールログを表示する。
console.log('Server start!');

// サーバー構築用の関数
function getFromClient(request, response) {
    // URLを構築するための変数を用意
    var url_parts = url.parse(request.url, true);
    switch (url_parts.pathname) {
        // sign画面
        case '/':
            ejs.render(sign_page, {});
            break;

        // other画面
        case '/login':
            response_login(request, response);
            break;    
        
        default:
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write('no pages...');
            break;
    }
}

// sign画面のアクセス処理
function response_sign(request, response){
    // POSTアクセス時の処理
    if (request.method == 'POST') {
        var body = '';
        // データ受信のイベント処理
        request.on ('data', function (data) {
            body += data;
        });
        // データ受信完了後のイベント処理
        request.on('end', function () {
            // データの解析
            data = qs.parse(body);
            // データを更新
            addToData(data.id, data.msg, filename, request);
            // メソッドの呼び出し
            write_sign(request, response);
        });
    } else {
        // メソッドの呼び出し
        write_sign(request, response);
    }
}

// other画面のアクセス処理
function response_login(request, response) {
    var content = ejs.render(login_page, {});
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

// sign画面の作成表示画面
function write_sign(request, response) {
    // 値をセットする。
    var msg = "※何かメッセージを書いてください。";
    // sign.ejsをレンダリングする。
    var content = ejs.render(sign_page, {
        title: "Index",
        content: msg,
        data: message_data,
        filename: 'data_item',
    });
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(content);
    response.end();
}

// テキストファイルをロードする
function readFromFile(fname) {
    fs.readFile (fname, 'utf8', (err, data) => {
        message_data = data.split('¥n');
    })
}
// データを更新する。
function addToData (id, msg, fname, request) {
    var obj = { 'id': id , 'msg': msg };
    // JSON形式のオブジェクトに変換する。
    var obj_str = JSON.stringify(obj);
    console.log('add data：' + obj_str);
    message_data.unshift(obj_str);
    // 最大保管数以上かどうかをチェックする。
    if (message_data.length > max_num) {
        message_data.pop();
    }
    // データを保存する。
    saveToFile (fname);
}

// データを保存するための関数
function saveToFile (fname) {
    var data_str = message_data.join('¥n');
    fs.writeFile (fname, data_str, (err) => {
        if (err) { throw err; }
    })
}
