var express = require('express');
var router = express.Router();
var socket = require('../Socket');

router.post('/', function (req, res) {
    var error;
    if (!req.body.nom) { //on recupère le nom
        error = "Chosisser un Pseudo...";
    }
    var users = socket.getUsers();
    if (!error && users.indexOf(req.body.nom) >= 0) {
        error = "Le pseudo \""+req.body.nom + "\" est deja utilisé, choisissez s'en un autre.";
    }
    if (!error) {
        res.render('chat', {
            title: 'Jeu',
            pseudo: req.body.nom,
            messages: socket.getLastMessages(),
            users: users
        });
    } else {
        
        res.render('index', { error:error, title: "Index" });
    }
    
    
});

router.post('/ajax', function (req, res) {
    if (req.body.nom) { //on recupère le nom
        socket.emitMessage({ Name : req.body.nom, Text: req.body.message , PostingDate: new Date() });
        res.send('OK');
    }
});


module.exports = router;