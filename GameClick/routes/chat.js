var express = require('express');
var router = express.Router();
var socket = require('../Socket');


/* GET home page. */
router.post('/', function (req, res) {
    if (req.body.nom) { //on recupère le nom
        res.render('chat', {
            title: 'Chat',
            pseudo: req.body.nom,
            messages: socket.getLastMessages(),
            users:socket.getUsers()
        });
    } else {
        res.render('index', { error: "choose a name", title: "Index" });
    }
});

/* GET home page. */
router.post('/ajax', function (req, res) {
    if (req.body.nom) { //on recupère le nom
        socket.emitMessage({ Name : req.body.nom, Text: req.body.message , PostingDate: new Date() });
        res.send('OK');
    }
});


module.exports = router;