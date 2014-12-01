'use strict';

global.Bacon = require('baconjs').Bacon;

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

var _ = require('lodash');

var encrypt = function (str, e, m) {
    var symbols = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ';
    return _.map(str, function (char) {
        var i = symbols.indexOf(char);
        i = BigNumber(i);
        return i.powm(e, m).toString();
    });
};

var decrypt = function (data, d, m) {
    var symbols = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM,.!? ';
    return _.reduce(data, function (memo, el) {
        el = BigNumber(el);
        var i = el.powm(d, m);
        return memo + symbols[i];
    }, '');
};

var rsa = require('./rsa');
var decryptedMessages = Bacon.combineWith(function (data, rsa) {
    data = encrypt(data, rsa.e, rsa.m);
    return decrypt(data, rsa.d, rsa.m);
}, encryptedMessages, rsa);

decryptedMessages.onValue(function (text) {
    console.log(text);
});