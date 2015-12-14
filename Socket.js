var emitMessage = function (message) {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        GLOBAL.sio.sockets.emit("message", message);
        if (!GLOBAL.sio.messages) {
            GLOBAL.sio.messages = [];
        }
        GLOBAL.sio.messages.push(message);
        if (GLOBAL.sio.messages.length > 7) {
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

var _isnotonpoint = function (point) {
    if (!GLOBAL.sio.points) {
        return true;
    }
    
    for (var i = 0; i < GLOBAL.sio.points.length; i++) {
        var pts = GLOBAL.sio.points[i];
        if (pts.X - 27 < point.X && pts.Y - 27 < point.Y && pts.X + 27 > point.X && pts.Y + 27 > point.Y) {
            return false;
        }
    }
    return true;
}

var _sendRandomPoint = function () {
    var point;
    do {
        point = {
            X: (Math.random() * 460) + 20,
            Y: (Math.random() * 260) + 20,
            Time: (Math.random() * 77) + 23
        };
    } while (!_isnotonpoint(point))
    
    
    emitPoint(point);
    if (GLOBAL.sio.isStartPoint) {
        GLOBAL.sio.intervalPoint = setTimeout(_sendRandomPoint, (Math.random() * 1000 * 3));
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
        if (!GLOBAL.sio.points) {
            GLOBAL.sio.points = [];
        }
        GLOBAL.sio.points.push(point);
        if (GLOBAL.sio.points.length > 5) {
            GLOBAL.sio.points.shift();
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
        GLOBAL.sio.sockets.emit("startGame", 60);
        
        emitScore("all", 0);
        
        startEmitPoints();
        setTimeout(function () {
            stopGame();
        }, 60 * 1000);
    }
}

var stopGame = function () {
    if (GLOBAL.sio && GLOBAL.sio.sockets) {
        stopEmitPoints();
        GLOBAL.sio.sockets.emit("stopGame", 20);
        setTimeout(function () {
            startGame();
        }, 20 * 1000);
    }
}


module.exports = {
    emitMessage: emitMessage, emitConnect: emitConnect,
    removePoint: removePoint, startEmitPoints: startEmitPoints,
    stopEmitPoints: stopEmitPoints, emitScore: emitScore, getLastMessages: getLastMessages,
    removeUser: removeUser, addUser: addUser, getUsers: getUsers, stopGame: stopGame,
    startGame : startGame
};
