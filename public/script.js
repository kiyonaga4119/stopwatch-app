const socket = io();
let elapsedTime = 0;
let splitTime = 0; // splitTime を追加
let running = false;
let lapStartTime = 0; // ラップ開始時刻を保持する変数

// const clickSound = new Audio("click.mp3"); // click.mp3を用意してください
// 各効果音用の Audio オブジェクトを定義
const startSound = new Audio("start.mp3");
const stopSound = new Audio("stop.mp3");
const lapSound = new Audio("lap.mp3");
const resetSound = new Audio("reset.mp3");

function playSound(sound) {
    const mute = document.getElementById("muteCheckbox").checked;
    if (!mute) {
        sound.currentTime = 0;
        sound.play();
    }
}

// function playClickSound() {
//     const mute = document.getElementById("muteCheckbox").checked;
//     if (!mute) {
//         // 連続再生に備え、currentTime をリセット
//         clickSound.currentTime = 0;
//         clickSound.play();
//     }
// }


function formatTime(ms) {
    let date = new Date(ms);
    let minutes = String(date.getUTCMinutes()).padStart(2, "0");
    let seconds = String(date.getUTCSeconds()).padStart(2, "0");
    let centiseconds = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, "0");
    return `${minutes}:${seconds}.${centiseconds}`;
}

function updateDisplay() {
    document.getElementById("time").textContent = formatTime(elapsedTime);
    let lapElapsed = elapsedTime - lapStartTime;
    document.getElementById("splitTime").textContent = formatTime(lapElapsed);
}



// サーバーから現在のタイムを受け取る
socket.on("updateTime", (data) => {
    elapsedTime = data.elapsedTime;
    running = data.running;
    lapStartTime = data.lapStartTime;  // サーバーからのlapStartTimeを使用
    updateDisplay();
    updateButtonState();
});





// サーバーからラップタイムのリストを受信（新しいものを上に表示）
socket.on("updateLaps", (laps) => {
    updateLapsDisplay(laps);
});

function updateButtonState() {
    const toggleButton = document.getElementById("toggle");
    const actionButton = document.getElementById("action");

    if (running) {
        toggleButton.textContent = "Stop";
        toggleButton.style.backgroundColor = "#dc3545";
        toggleButton.style.boxShadow = "0 0 10px rgba(220, 53, 69, 0.7)";

        actionButton.textContent = "Lap";
        actionButton.style.backgroundColor = "#ffc107";
        actionButton.style.boxShadow = "0 0 10px rgba(255, 193, 7, 0.7)";
    } else {
        toggleButton.textContent = "Start";
        toggleButton.style.backgroundColor = "#007bff";
        toggleButton.style.boxShadow = "0 0 10px rgba(0, 123, 255, 0.7)";

        actionButton.textContent = "Reset";
        actionButton.style.backgroundColor = "#28a745";
        actionButton.style.boxShadow = "0 0 10px rgba(40, 167, 69, 0.7)";
    }
}

// 「開始 / 停止」ボタンの切り替え
document.getElementById("toggle").addEventListener("mousedown", () => {

    if (running) {
        playSound(stopSound);  // ストップ時の音
        socket.emit("stop");
    } else {
        playSound(startSound);
        // スタート時は両方のタイマーを0から始める
        lapStartTime = 0;
        socket.emit("start");
    }
});

// 「ラップ / リセット」ボタンの切り替え
document.getElementById("action").addEventListener("mousedown", () => {
    if (running) {
        playSound(lapSound);
        const lapTime = formatTime(elapsedTime);
        socket.emit("lap", lapTime);
    } else {
        playSound(resetSound);
        socket.emit("reset");
    }
});


function formatTimeFromMs(ms) {
    let minutes = Math.floor(ms / 60000);
    let seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(5, "0")}`;
}

function updateLapsDisplay(laps) {
  const lapsContainer = document.getElementById("laps");


    lapsContainer.innerHTML = ""; // リストをクリア

    laps.reverse().forEach((lapData, index) => {
      const lapElement = document.createElement("div");

      lapElement.className = "lap";


        let lapN = String(laps.length - index).padStart(2, "0"); // 2桁固定にする


      lapElement.textContent = `${lapN}: ${formatTimeFromMs(lapData.lap)} | ${formatTimeFromMs(lapData.split)}`; // ミリ秒を適切にフォーマット

        // 一行おきに背景色を変更
        if (index % 2 === 0) {
            lapElement.style.backgroundColor = "#1f1f1f"; // 明るいグレー
        } else {
            lapElement.style.backgroundColor = "#000"; // 白
        }
      lapsContainer.appendChild(lapElement);
    });
}

// ボタン無効化切替のイベントリスナー
document.getElementById("disableButtons").addEventListener("change", () => {
    const disable = document.getElementById("disableButtons").checked;
    document.getElementById("toggle").disabled = disable;
    document.getElementById("action").disabled = disable;
});
