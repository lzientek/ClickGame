var lastClickPosition = {};
var socket = io.connect();
var canvas, context, pointTab = [];
var colorArrayPrimary = ["#2980b9","#27ae60","#8e44ad","#f1c40f","#c0392b","#d35400"];
var colorArraySecondary = ["#3498db","#2ecc71","#9b59b6","#f39c12","#e74c3c","#e67e22"];
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
    context.clearRect(point.X - (circleSize + 10), point.Y - (circleSize + 10), (circleSize + 10) * 2, (circleSize + 10) * 2);
}


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

//display a circle
function displayCircle(point,color) {
    context.fillStyle = color;//todo:random color
    context.beginPath();
    context.arc(point.X, point.Y, circleSize, 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

socket.on('point', function (point) {
    var rand = Math.round(Math.random()* colorArrayPrimary.length);
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
        if (lastClickPosition.x && (point.X - circleSize) < lastClickPosition.x && (point.Y - circleSize) < lastClickPosition.y 
            && (point.X + circleSize) > lastClickPosition.x && (point.Y + circleSize) > lastClickPosition.y) {
            clearInterval(myAnim);
            clearCircle(point);
            lastClickPosition.x = 0;
            var scr = Math.round((101 - point.Time) * 100 / i);
            socket.emit("makePoints", scr);
            $("#score-board").text(scr);
            $("#score-board").addClass("green-color");
            $("#game").addClass("green-border");
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
    canvas.addEventListener('click', function (evt) {
        $("#game").removeClass("red-border");
        $("#game").removeClass("green-border");
        $("#score-board").removeClass("green-color");
        $("#score-board").removeClass("red-color");
        lastClickPosition = getMousePos(canvas, evt);
        setTimeout(function () {
            if (lastClickPosition.x !== 0) {
                var scr = -50;
                socket.emit("makePoints", scr);
                $("#game").addClass("red-border");
                $("#score-board").text(scr);
                $("#score-board").addClass("red-color");
                lastClickPosition.x = 0;
            }
        }, 150);
    }, false);
});