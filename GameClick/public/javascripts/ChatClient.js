
var socket = io.connect();
var canvas, context;
var circleSize = 20;
//receive messsage
socket.on('message', function (message) {
    var result = '<div class="message" ><h4>' + message.Name + '</h4><p>' + message.Text + '</p><p>' + message.PostingDate + '</p></div>';
    $("#msgContainer").append(result);
    $("#msgContainer").scrollTop($("#msgContainer")[0].scrollHeight);
});

//receive messsage
socket.on('connectMsg', function (value) {
    if (value.Type === "connected") {
        var result = '<li id="name_' + value.Name + '">' + value.Name + ' <span class="score">0</span></li>';
        $("#userList").append(result);
    } else {
        $("#name_" + value.Name).remove();
    }
});

//receive score update for a user
socket.on('addScore', function (value) {
    var actualScore = parseInt($("#name_" + value.Name).find(".score").text());
    $("#name_" + value.Name).find(".score").text(actualScore + value.Score);
});

//clear a circle
function clearCircle(point) {
    context.clearRect(point.X - (circleSize +10), point.Y - (circleSize + 10), (circleSize + 10) * 2, (circleSize + 10) * 2);
}

//display a circle
function displayCircle(point) {
    context.fillStyle = "#ff0000";//todo:random color
    context.beginPath();
    context.arc(point.X, point.Y, circleSize, 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

socket.on('point', function (point) {
    displayCircle(point);
    var flow = 1;
    var flowDir = +1;
    var i = 1;
    var myAnim = setInterval(function () {
        clearCircle(point);
        displayCircle(point);
        context.beginPath();
        context.strokeStyle = "#ff1212";
        var angle = Math.PI * 2 * (i / point.Time);
        context.arc(point.X, point.Y, circleSize + flow / 2, angle, Math.PI * 2);
        i++;
        
        context.lineWidth = 3 + (flow);
        if (flow === 7) { flowDir = -1; }
        if (flow === 0) { flowDir = 1; }
        flow = flowDir + flow;
        
        context.stroke();
        context.closePath();
        if (i > point.Time) {
            clearInterval(myAnim);
            clearCircle(point);
        }
    }, 1000 / 30);
});

function sendMessageChat() {
    var text = $("#sendMsgText").val();
    $.post("/chat/ajax", { nom: $("#HiddenName").val(), message: text });
    $("#sendMsgText").val("");
}

$(function () {
    $("#msgContainer").scrollTop($("#msgContainer")[0].scrollHeight);
    if ($("#HiddenName")) {
        socket.emit("connectMsg", $("#HiddenName").val());
    }
    
    $("#msgForm").submit(function () {
        sendMessageChat();
        return false;
    });
    
    $("#sendMsgButton").click(function () {
        sendMessageChat();
    });
    
    //convas programming
    canvas = document.getElementById("game");
    context = canvas.getContext('2d');

});