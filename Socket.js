var emitMessage = function (message) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("message", message);
        if (!GLOBAL.sio.messages) {
            GLOBAL.sio.messages = [];
        }
        GLOBAL.sio.messages.push(message);
        if (GLOBAL.sio.messages.length > 4) {
            GLOBAL.sio.messages.shift();
        }
    }
}

var getLastMessages = function () {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        if (!GLOBAL.sio.messages) {
            GLOBAL.sio.messages = [];
        }
        return GLOBAL.sio.messages;
    }
    return [];
}
var _sendRandomPoint = function () {
    emitPoint({
        X: (Math.random() * 460) + 20,
        Y: (Math.random() * 260) + 20,
        Time : (Math.random() * 85) + 15
    });
    if (GLOBAL.sio.isStartPoint) {
        GLOBAL.sio.intervalPoint = setTimeout(_sendRandomPoint, (Math.random() * 1000 * 5) + 3);
    }
};

var startEmitPoints = function () {
    if (GLOBAL.sio.isStartPoint) {
        return;
    }
    GLOBAL.sio.isStartPoint = true;
    GLOBAL.sio.intervalPoint = setTimeout(_sendRandomPoint, 1000);
}

var stopEmitPoints = function () {
    GLOBAL.sio.isStartPoint = false;
}

var emitPoint = function (point) {
    if (GLOBAL.sio && GLOBAL.sio.sockets && GLOBAL.sio.isStartPoint) {
        if (!GLOBAL.sio.countPoints) {
            GLOBAL.sio.countPoints = 0;
        }
        
        point.Id = ++GLOBAL.sio.countPoints;
        GLOBAL.sio.sockets.emit("point", point);
    }
}

var removeUser = function (name) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        if (GLOBAL.sio.users) {
            var index = GLOBAL.sio.users.indexOf(name);
            if (index > 0) {
                GLOBAL.sio.users.splice(index, 1);
            }
        }
    }
}

var addUser = function (name) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        if (!GLOBAL.sio.users) {
            GLOBAL.sio.users = [];
        }
        GLOBAL.sio.users.push(name);
    }
}

var getUsers = function () {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        if (!GLOBAL.sio.users) {
            GLOBAL.sio.users = [];
        }
        return GLOBAL.sio.users;
    }
}

var removePoint = function (id) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("removePoint", id);
    }
}
var emitScore = function (usrName, score) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("addScore", { Name: usrName, Score: score });
    }
}
var emitConnect = function (name, type) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("connectMsg", { Name: name, Type: type });
    }
}
var startGame = function () {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("startGame", 30);
        
        emitScore("all", 0);
        
        startEmitPoints();
        setTimeout(function () {
            stopGame();
        }, 30 * 1000);
    }
}

var stopGame = function () {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        stopEmitPoints();
        GLOBAL.sio.sockets.emit("stopGame", 10);
        setTimeout(function () {
            startGame();
        }, 10 * 1000);
    }
}


module.exports = {
    emitMessage: emitMessage, emitConnect: emitConnect,
    removePoint: removePoint, startEmitPoints: startEmitPoints,
    stopEmitPoints: stopEmitPoints, emitScore: emitScore, getLastMessages: getLastMessages,
    removeUser: removeUser, addUser: addUser, getUsers: getUsers, stopGame: stopGame,
    startGame : startGame
};