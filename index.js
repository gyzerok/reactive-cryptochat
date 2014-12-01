'use strict';

global.Bacon = require('baconjs').Bacon;
global._ = require('lodash');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

server.listen(1337, function () {
    console.log('Listening');
});

app.use(express.static(__dirname + '/public'));

var conns = Bacon.fromBinder(function (sink) {
    io.on('connect', sink);
});

var encryptedMessages = conns.flatMap(function (socket) {
    return Bacon.fromBinder(function (sink) {
        socket.on('message', sink);
    });
});

var rsa = require('./rsa');
var decryptedMessages = rsa.decryptor(rsa.encryptor(encryptedMessages, rsa.rsa));

decryptedMessages.onValue(function (text) {
    console.log(text);
});