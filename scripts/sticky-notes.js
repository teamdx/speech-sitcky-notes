
// 接続先URI
const uri = "wss://voice-develop.mybluemix.net/wsvoice";

// WebSocketオブジェクト
var webSocket = null;

/**
 * 付箋の作成
 */
$.stickey_notes = function () {

    let stickey_notes =  (arguments) => {

        //パラメータを取得
        let param = arguments[0];

        //付箋のレイアウト
        let elem = $(
                '<div class="draggable stickey-notes-normal " id="'+ param.id +'" >'
                    + '<div class="accordion-title" onclick="setAccordion(\''+param.id + '\')"></div>'
                    + '<div class="stickey-notes-close" onclick="removeStickeyNotes(\''+param.id + '\')">×</div><br>'
    //                + '<div class="stickey-notes-title">'+ param.name +'</div>'
                    + '<div class="stickey-notes-message" contenteditable="true">'+param.message+"<br>"
                        +'<table><tr>'
                        + '<td><input type="color" class="color" id="color" value="#efcc4c" list="colorList" onchange="changeStickeyNotesColor(this.value,\''+param.id + '\')"></td>'
                        + '<td><a class="btn_good" value="0" onclick="clickGoodBad(1,\''+param.id + '\')"><img class="goodBad" src="./images/good.png"/></a></td>'
                        + '<td><a class="btn_bad" value="0" onclick="clickGoodBad(2,\''+param.id + '\')"><img class="goodBad" src="./images/bad.png"/></a></td>'
                        +'</tr></table>'
                    + '</div>'
                + '</div>');

        //付箋を追加
        $("#tag-erea").prepend(elem);

        //付箋の色を変更
        elem.ready(function() {
            $("#" + param.id + ".stickey-notes-normal").css("background", param.color);
            //カラーピッカー
            $("#" + param.id + " > div > table > tbody > tr > td > .color").val(param.color);
        });

        //付箋のドラッグ許可
        $('.draggable').draggable({
            opacity: 0.5,
//            zIndex: 100,
            stack: '.draggable'
        });

        //付箋のドラッグをドロップした時
        $(".draggable").on("dragstop", function(event, ui) {
            console.log("drag end:" + this.id + " " + this.style.left + "," + this.style.top); 
            let param = {mode:"move", id:this.id, left:this.style.left, top:this.style.top};
            //Socketメッセージ送信(main.js)
            sendMessage(param);
        });

    }
    stickey_notes(arguments);

    //付箋の色を変更
    changeStickeyNotesColor = (color, tag) => {
        console.log("color change:" + color + "," + tag);
        $("#" + tag + ".stickey-notes-normal").css("background", color);
    }

    //付箋の削除処理
    removeStickeyNotes = (tag) => {
        //Socketメッセージ送信(main.js)
        sendMessage({mode:"delete", id:tag})
        console.log("remove");
    }

    //アコーディオン動作
    setAccordion = (tag) => {
        /*クリックでコンテンツを開閉*/
        $("#" + tag + " > .stickey-notes-message").slideToggle(200);
        /*矢印の向きを変更*/
        $("#" + tag + " > .accordion-title").toggleClass('open', 200);
    }

    //Good/Badボタンのクリック処理
    clickGoodBad = (mode,tag) => {

        let goodBad;
        let className;
        if (mode == 1) {
            //goodボタンの取得
            goodBad = $("#" + tag + " > div.stickey-notes-message > table > tbody > tr > td > .btn_good"); 
            className = "btn_good_on";

        }
        else {
            //badボタンの取得
            goodBad = $("#" + tag + " > div.stickey-notes-message > table > tbody > tr > td > .btn_bad"); 
            className = "btn_bad_on";

        }

        //現在の値を取得
        let val = goodBad.attr("value");

        //値が0の場合は、cssクラスを設定
        if (val == "0") {
            goodBad.addClass(className);
        }
        else {
            goodBad.removeClass(className);
        }

        //値を変更して再設定
        console.log(tag + "," + val);
        val = (val == "0" ? "1" : "0");
        goodBad.attr("value", val);

    }

}


/**
 * 音声認識の設定
 */
window.addEventListener("DOMContentLoaded", () => { 
    let recognition;       //音声認識用
    let voiceText = "";    //音声認識結果の文字列
    let listening = false; //true:音声認識中
    let button = document.getElementById("btnRecStart"); //音声認識ボタン
    let result = document.getElementById("message");     //音声認識結果表示


    //音声認識が使用できない場合
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition 
    if (typeof SpeechRecognition === "undefined") { 
        alert("音声認識非対応です");
 
    } else { 
        //音声認識の設定
        recognition = new SpeechRecognition(); 
        recognition.lang = 'ja-JP'; 
        recognition.continuous = true; 
        recognition.interimResults = true; 

        //音声認識の処理
        recognition.addEventListener("result", event => { 

            //音声認識された結果を取得
            res = event.results[event.results.length-1];

            //音声認識された文章
            voiceText = res[0].transcript;

            //音声認識結果を画面に表示
            result.value =  voiceText; 

            //音声認識した文章が終了した場合
            if (res.isFinal) {                 
                //Socketメッセージ送信(main.js)
                sendMessage({mode:"create", message:voiceText});
            } 

        });

        //音声認識の開始
        const start = () => { 
            recognition.start(); 
        };

        //音声認識の停止
        const stop = () => { 
            recognition.stop(); 
        };

        //音声認識ボタンが押された時の処理
        button.addEventListener("click", () => { 
            //listeningがtrueの時は、stop()関数を呼び出す
            //listeningがfalseの時は、start()関数を呼び出す
            listening ? stop() : start(); 
            //listeningの値を反転(true⇔false)
            listening = !listening; 
        });             

        //音声認識が開始した時
        recognition.onstart = () => {
        }

        recognition.onend = () => {
            //音声認識を再スタート
            recognition.start(); 
        }
    } 
});


/**
 * WebSocket処理（NodeRed）
 */
 function openWebSocket() {

    return new Promise((resolve,reject) => {

        //NodeRedへ未接続の場合
        if (webSocket == null) {

            // NodeRedへ接続
            webSocket = new WebSocket(uri);

            // NodeRedへ接続できた場合
            webSocket.onopen = (ev) => {
                console.log("Connect..");
                resolve();
            };
            
            // NodeRedからメッセージを受け取った場合
            webSocket.onmessage = (ev) => {
                if (ev && ev.data) {
                    var receive = JSON.parse(ev.data); 
                    console.log(receive);
                    //受信処理
                    receiveMessage(receive);
                }
            };

            // NodeRedとの接続を閉じた場合
            webSocket.onclose = (ev) => {
                console.log("disconnect(" + ev.code + ")");
                webSocket = null;
            };

            // NodeRedとの接続でエラーが発生した場合
            webSocket.onerror = (ev) => {
                console.log("Error " + ev);
                resolve();
            };
        }
    });
}

/**
 * ハッシュコードの生成
 * @param {*} text 
 * @returns 
 */
async function sha256(text){
    const uint8  = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', uint8)
    return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2,'0')).join('')
}

/**
 * ユニークコードの取得
 * @param {*} myStrong 
 * @returns 
 */
function getUniqueStr(myStrong){
    var strong = 1000;
    if (myStrong) strong = myStrong;
    return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
}
