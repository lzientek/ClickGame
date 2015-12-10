var lastClickPosition = {};
var socket = io.connect();
var canvas, context, pointTab = [];
var colorArrayPrimary = ["#2980b9", "#27ae60", "#8e44ad", "#f39c12", "#c0392b", "#d35400"];
var colorArraySecondary = ["#3498db", "#2ecc71", "#9b59b6", "#f1c40f", "#e74c3c", "#e67e22"];
var circleSize = 20;
var isPlaying = false;

function drawString(ctx, text, posX, posY, textColor, font, fontSize) {
    var lines = text.split("\n");
    var rotation = 0;
    if (!font) font = "'serif'";
    if (!fontSize) fontSize = 16;
    if (!textColor) textColor = '#000000';
    ctx.save();
    ctx.font = fontSize + "px " + font;
    ctx.fillStyle = textColor;
    ctx.translate(posX, posY);
    ctx.rotate(rotation * Math.PI / 180);
    for (i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 0, i * fontSize);
    }
    ctx.restore();
}

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

function displayWinner() {
    var winnerName = "", winnerScore = 0;
    $(".score").each(function (parameters) {
        
        var score = parseInt($(this).text());
        if (score > winnerScore) {
            winnerScore = score;
            winnerName = $(this).parent().prop("id").replace("name_", "");
        }
    });
    var textToDisplay = "Wait...";
    if (winnerName == $("#HiddenName").val()) {
        //display you win
        textToDisplay = "You win!\n ( " + winnerScore + " points)";
    } else if (winnerName != "") {
        textToDisplay = winnerName + " win!\n ( " + winnerScore + " points)";
    }
    drawString(context, textToDisplay, 50, 100, '#2980b9', 'lato', 40);
}


var timerInterval;
//start
socket.on('startGame', function (value) {
    isPlaying = true;
    context.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        value--;
        if (value <= 10) {
            
            $("#timerText").html('<span class="red-color">' + value + "</span>  secondes restantes! Cliquez!!!");
        } else {
            $("#timerText").html('<span class="">' + value + "</span> secondes restantes! Cliquez!!!");
        }
    }, 1000);
    
});

//stop
socket.on('stopGame', function (value) {
    isPlaying = false;
    context.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(timerInterval);
    displayWinner();
    timerInterval = setInterval(function () {
        value--;
        if (value <= 5) {
            
            $("#timerText").html('<span class="red-color">' + value + "</span> secondes avant la prochaine partie!");
        } else {
            $("#timerText").html('<span class="">' + value + "</span> secondes avant la prochaine partie!");
        }
    }, 1000);
});

//receive score update for a user
socket.on('addScore', function (value) {
    if (value.Name == "all") {
        $(".score").text("0");
    } else {
        var actualScore = parseInt($("#name_" + value.Name).find(".score").text());
        $("#name_" + value.Name).find(".score").text(actualScore + value.Score);
    }
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
function displayCircle(point, colorIndex) {
    context.fillStyle = colorArrayPrimary[colorIndex];
    context.beginPath();
    context.arc(point.X, point.Y, circleSize, 0, Math.PI * 2);
    context.fill();
    context.closePath();
}

socket.on('point', function (point) {
    var rand = Math.round(Math.random() * colorArrayPrimary.length);
    displayCircle(point, rand);
    var flow = 1;
    var flowDir = +1;
    var i = 1;
    var myAnim = setInterval(function () {
        if (!isPlaying) {
            clearInterval(myAnim);
            return;
        }
        clearCircle(point);
        displayCircle(point, rand);
        context.beginPath();
        context.strokeStyle = colorArraySecondary[rand];
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
        if (!isPlaying) {
            return;
        }
        
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