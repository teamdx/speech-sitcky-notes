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

    // //付箋作成ボタン
    // buttonAdd = document.getElementById("buttonAdd");

    // //WebSocket
    // Promise.all([openWebSocket()])
    // .then(() => {

    //     //【泉野】
    //     var textlist = document.getElementsByTagName('a');
    //  /*   alert(textlist[0].textContent);*/

    //     //付箋作成ボタンが押されたとき
    //     buttonAdd.addEventListener("click", () => { 
    //         //Socketメッセージ送信
    //         sendMessage({mode:'create', message:$("#message").val()});
    //     });
    
    //     //名前の入力
    //     // var userName = "guest";;
    //     // $("#userName").val(userName);

    //     //デバッグとして付箋内容を設定
    //     //$("#message").val("入社後私は。部活動で部長であった経験を活かし、御社に貢献していきたいと考えています。");

    // })

});

function OnLinkClick() {
    var textlist = document.getElementsByTagName('a');
    var target =textlist[0].textContent;

   /* target = document.getElementById("lists");*/
    sendMessage({ mode: 'create', message: $("#textlist").val() });
    return false;
}

//add 2021/8/23 saito >>
//渡された文字列で付箋を作成
function createFusen(msg) {
    sendMessage({ mode: 'create', message: msg });
}
//<< add 2021/8/23 saito

/*text形式でログを出力*/
function createTextFile() {
    var text = "【非面接者氏名】" + document.getElementById("interviewerName").value + "\r\n【発言内容】\r" + commentLog;

    //ファイル出力処理
    var blob = new Blob([text], { "type": "text/plain" });
    var downloadLink = document.getElementById("logFile");

    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.click();
}

//付箋の内容をテキスト出力
function createFusenFile() {

    var text = "";
    //付箋を列挙
    $('.stickey-notes-normal').each(function(index, elem){
        let id = $(elem).attr('id');

        //カテゴリ名
        let categoryName = $("#" + id + " > .category-name").text();

        //内容
        let message = $("#" + id + " > .stickey-notes-message").text();

        //評価
        let goodBad = "";
        if ($("#" + id + " > div.stickey-notes-message > table > tbody > tr > td > .btn_good").attr("value") == 1) {
            goodBad = "Good";
        }
        else if ($("#" + id + " > div.stickey-notes-message > table > tbody > tr > td > .btn_good").attr("value") == 1) {
            goodBad = "Bad";
        }

        //出力内容
        text += categoryName + "," + message + "," + goodBad + "\r\n" ;

    });

    //ファイル出力処理
    var blob = new Blob([text], { "type": "text/plain" });
    var downloadLink = document.getElementById("funsenFile");

    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.click();
}