/**
 * 画面制御処理
 * ・NodeRedへ付箋情報を送信
 * ・NodeRedから付箋情報を取得し、付箋を作成
 * ・
 */


let buttonAdd; //付箋作成ボタン

/**
 * Socketメッセージ送信(NodeRedへ送信)
 */
function sendMessage(param) {
    switch(param.mode) {
        case "create":
            //Primary Key
            var key = getUniqueStr();
            param.id = key;
            //UserName
            // param.name = $("#userName").val();
            //color
            param.color = $("#color").val();
            break;
    }

    //NodeRedを使って付箋作成
    //webSocket.send(JSON.stringify(param));

    //NodeRedを使わずに付箋作成
    receiveMessage(param);
}

/**
 * Socketメッセージ受信(NodeRedから受信)
 */
function receiveMessage(msg) {

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
 * 処理開始時
 */
 window.addEventListener("DOMContentLoaded", () => { 

    //付箋作成ボタン
    buttonAdd = document.getElementById("buttonAdd");

    //WebSocket
    Promise.all([openWebSocket()])
    .then(() => {
        
        //付箋作成ボタンが押されたとき
        buttonAdd.addEventListener("click", () => { 
            //Socketメッセージ送信
            sendMessage({mode:'create', message:$("#message").val()});

        });
    
        //名前の入力
        // var userName = "guest";;
        // $("#userName").val(userName);

        //デバッグとして付箋内容を設定
        $("#message").val("入社後私は、部活動で部長であった経験を活かし、御社に貢献していきたいと考えています。");

    })

});
