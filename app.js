var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require("http");
var socketHelper = require("./Socket.js");





var routes = require('./routes/index');
var chat = require('./routes/chat');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    next();
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/chat', chat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var  server = http.createServer(app).listen(process.env.PORT || 1337, function () {
    console.log("http server listening on port 1337");
});
var io = require('socket.io').listen(server);

GLOBAL.sio = io;
var nbUsers = 0;
GLOBAL.sio.sockets.on('connection', function (socket, value) {
    socket.on('connectMsg', function (data) { // only on connection in the chat with name
        if (data != null) {
            nbUsers++;
            socketHelper.startEmitPoints();
            socketHelper.addUser(data);
            socketHelper.emitConnect(data, "connected");
            socket.on("makePoints", function (score) {
                socketHelper.emitScore(data, score);
            });
            socket.on("disconnect", function () {
                socketHelper.removeUser(data);
                nbUsers--;
                if (nbUsers === 0) {
                    socketHelper.stopEmitPoints();
                }
                socketHelper.emitConnect(data, "disconnected");
            });
        }
    });
});
module.exports = app;
