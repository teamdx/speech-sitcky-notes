
// 接続先URI
const uri = "wss://voice-develop.mybluemix.net/wsvoice";

// WebSocketオブジェクト
var webSocket = null;

/**
 * 付箋の作成
 */
$.stickey_notes = function () {

    var stickey_notes =  (arguments) => {

        //パラメータを取得
        var param = arguments[0];

        console.log("create stickey_notes:");
        console.log(param);

        //付箋のレイアウト
        var elem = $(
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
            zIndex: 999,
        });

        // イベント名を使用
        $(".draggable").on("drag", function(event, ui) {

        });

        //付箋をドロップした時
        $(".draggable").on("dragstop", function(event, ui) {
            console.log("drag end:" + this.id + " " + this.style.left + "," + this.style.top); 
            var param = {mode:"move", id:this.id, left:this.style.left, top:this.style.top};
            sendMessage(param);
        });

    }
    stickey_notes(arguments);

    //メッセージ変更イベント
    changeMessage = (msg) => {

    }
    changeStickeyNotesColor = (color, tag) => {
        console.log("color change:" + color + "," + tag);
        $("#" + tag + ".stickey-notes-normal").css("background", color);
    }

    //削除イベント
    removeStickeyNotes = (tag) => {
//        $(tag).parent().remove();
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

        //0の場合は、クラスを設定
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
    const button = document.getElementById("button"); 
    const result = document.getElementById("result"); 

    var voiceText = "";

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition 
    if (typeof SpeechRecognition === "undefined") { 
        // button.remove(); 
        // const message = document.getElementById("message"); 
        // message.removeAttribute("hidden"); 
        // message.setAttribute("aria-hidden", "false"); 
        alert("音声認識非対応です");
    } else { 
        // good stuff to come here 
        let listening = false; 
        const recognition = new SpeechRecognition(); 
        // const start = () => {}; 
        // const stop  = () => {}; 
        // const onResult = event => {}; 

        const onResult = event => { 
            result.innerHTML = ""; 
            console.log(event.results);

            res = event.results[event.results.length-1];

            const text = document.createTextNode(res[0].transcript); 
            const p = document.createElement("p"); 
            if (res.isFinal) { 
                p.classList.add("final"); 
                voiceText = res[0].transcript;//確定した
                sendMessage({mode:"create", message:voiceText});
                // recognition.stop();
                // recognition.start(); 
            } 
            p.appendChild(text); 
            result.appendChild(p); 
        };

        const start = () => { 
            recognition.start(); 
        };

        const stop = () => { 
            recognition.stop(); 
        };

        recognition.continuous = true; 
        recognition.interimResults = true; 
        recognition.addEventListener("result", onResult); 

        button.addEventListener("click", () => { 
            listening ? stop() : start(); 
            listening = !listening; 
            console.log("click");
        });             


        recognition.onstart = () => {
    //                    addMessage("音声認識開始");
        }

        recognition.onend = () => {
    //                    addMessage("音声認識終了");
            recognition.start(); 
        }
    } 
});


/**
 * WebSocket処理
 */
 function openWebSocket() {

    return new Promise((resolve,reject) => {
        if (webSocket == null) {
            // 初期化
            webSocket = new WebSocket(uri);
            // イベントハンドラ
            webSocket.onopen = (ev) => {
                console.log("Connect..");
                resolve();
            };
        
            webSocket.onmessage = (ev) => {
                if (ev && ev.data) {
                    var receive = JSON.parse(ev.data); 
                    console.log(receive);
                    receiveMessage(receive);
                }
            };

            webSocket.onclose = (ev) => {
                console.log("disconnect(" + ev.code + ")");
                webSocket = null;
            };

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
