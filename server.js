const express = require("express"); // Express を読み込む
const app = express(); // Express アプリを作成
const port = 3000; // ポート番号

// "public" フォルダを静的ファイルとして提供
app.use(express.static("public"));

// ルート（"/"）にアクセスしたときに `index.html` を表示
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// サーバーを起動
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
