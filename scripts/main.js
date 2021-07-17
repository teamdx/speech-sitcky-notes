let buttonAdd;

/**
 * Socketメッセージ送信
 */
function sendMessage(param) {
    switch(param.mode) {
        case "create":
            //Primary Key
            var key = getUniqueStr();
            param.id = key;
            //UserName
            param.name = $("#userName").val();
            //color
            param.color = $("#color").val();
            break;
    }
    // console.log("sendMessage:" + JSON.stringify(param));
    webSocket.send(JSON.stringify(param));
}

/**
 * Socketメッセージ受信
 */
function receiveMessage(msg) {
    // console.log("receive:" + msg.mode);
    // console.log(msg);

    switch (msg.mode) {
        case "create":
            //付箋の作成
            $.stickey_notes(msg);
            break;

        case "delete":
            //付箋の削除
            $("#" + msg.id).remove();
            break;

        case "move":
            //付箋の移動
            $("#" + msg.id).css("left", msg.left);
            $("#" + msg.id).css("top", msg.top);

            break;

    }

}            

/**
 * 音声認識されたメッセージ
 */
function addMessage(msg) {
    const p = document.createElement("p"); 
    const text = document.createTextNode(msg); 
    p.appendChild(text); 
    result.appendChild(p); 
}

/**
 * 処理開始時
 */
 window.addEventListener("DOMContentLoaded", () => { 

    //WebSocket
    Promise.all( [openWebSocket()])
    .then(() => {
        buttonAdd = document.getElementById("buttonAdd");
        buttonAdd.addEventListener("click", () => { 
            //テスト
            sendMessage({mode:'create', message:$("#message").val()});
        });
    
        //名前の入力
        var userName = "guest";//window.prompt("ユーザー名を入力してください", "");
        $("#userName").val(userName);
    
        $("#message").val("入社後私は、部活動で部長であった経験を活かし、御社に貢献していきたいと考えています。");
        sendMessage({mode:'create', message:$("#message").val()});
    
    })


});
