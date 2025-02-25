const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

let startTime = 0;
let elapsedTime = 0;
let splitTime = 0; // splitTime を追加
let running = false;
let timerInterval;
let laps = [];
let lapStartTime = 0;
let currentName = "";


function broadcastTime() {
    io.emit("updateTime", { elapsedTime, running, lapStartTime });
}


function broadcastLaps() {
    io.emit("updateLaps", laps);
}

io.on("connection", (socket) => {
    console.log("新しいクライアントが接続しました");

    // 接続したクライアントに最新の状態を送信
    socket.emit("updateTime", { elapsedTime, running });
    socket.emit("updateLaps", laps);
    socket.emit("updateName", currentName);

    // 名前変更イベントの受信とブロードキャスト
    socket.on("nameChange", (newName) => {
        currentName = newName;
        io.emit("updateName", currentName);
    });


socket.on("start", () => {
    if (!running) {
        startTime = Date.now() - elapsedTime;
        if (elapsedTime === 0) {
            lapStartTime = 0;
        }
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            broadcastTime();
        }, 10);
        running = true;
        broadcastTime();

        io.emit("globalSound", "start");

    }
});




socket.on("stop", () => {
    if (running) {
        clearInterval(timerInterval);
        running = false;
        broadcastTime();
                io.emit("globalSound", "stop");
    }
});


socket.on("reset", () => {
    clearInterval(timerInterval);
    elapsedTime = 0;
    running = false;
    laps = [];
    lapStartTime = 0;
    broadcastTime();
    broadcastLaps();
            io.emit("globalSound", "reset");
});



function parseTimeToMs(timeString) {
    let parts = timeString.split(":");
    let minutes = parseInt(parts[0], 10);
    let seconds = parseFloat(parts[1]);
    return minutes * 60000 + seconds * 1000; // ミリ秒に変換
}

function formatTimeFromMs(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(5, "0")}`;
}

socket.on("lap", (lapTime) => {
    let lapMs = parseTimeToMs(lapTime);
    let previousLap = laps.length > 0 ? laps[laps.length - 1].lap : 0;
    let splitTime = lapMs - previousLap;
    laps.push({ lap: lapMs, split: splitTime });
    lapStartTime = lapMs;  // ここでlapStartTimeを更新
    broadcastLaps();
    broadcastTime();
            io.emit("globalSound", "lap");
});







    socket.on("disconnect", () => {
        console.log("クライアントが切断しました");
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
